import jwt from "jsonwebtoken";
import User from "../models/user.js";
import sessionModel from "../models/session.js";
import crypto from "crypto";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password }); // hashed automatically by pre-save hook

    // create the JWT refresh token
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const session = await sessionModel.create({
      userId: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // create the JWT access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        sessionId: session._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5m",
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // set true when running on HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 5 * 60 * 1000,
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "credentials required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Invalid credentials user not found" });
    }

    const passwordValid = await user.comparePassword(password);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // create the JWT refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // const isSession = sessionModel.findOne({
    //   user: user._id,
    //   revoked: false,
    // });

    await sessionModel.deleteMany({
      userId: user._id,
    });

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const session = await sessionModel.create({
      userId: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // create the JWT access token
    const accessToken = jwt.sign(
      { id: user._id, sessionId: session._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "5m",
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // set true once you're running on HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // set true once you're running on HTTPS
      sameSite: "strict",
      maxAge: 5 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// PROFILE (protected)
// req.userId comes from the middleware created for authentication
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//refresh token
export const getNewToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(400).json({
        message: "No refresh token found",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const session = await sessionModel.findOne({
      refreshTokenHash,
      revoked: false,
    });
    if (!session) {
      return res.status(400).json({
        message: "unauthorized session already revolked or not found",
      });
    }

    const refreshToken =  jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    //new session for refresh token 
    const newRefreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const newSession = await sessionModel.create({
      userId: decoded.id,
      refreshTokenHash: newRefreshTokenHash,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    const accessToken = jwt.sign(
      { id: decoded.id, sessionId: newSession._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "5m",
      },
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //true when using https
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // true when using https
      sameSite: "strict",
      maxAge: 5 * 60 * 1000,
    });

    // old session delete here but you can update revoked true and then if someone try use that token you can catch that unauthorizedd activity
    await session.deleteOne();

    res.status(200).json({
      message: "New token generated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(400).json({
      message: "unauthorized no token found",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const session = await sessionModel.findOne({
      refreshTokenHash,
      revoked: false,
    });

    if (!session) {
      return res.status(400).json({
        message: "invalide refresh token",
      });
    }

    // session revoked true here
    //can undate revoked:true here also so that we can notify user someone unauthorized person try to access private route
    await session.deleteOne();

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.status(200).json({
      message: "Logout successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
