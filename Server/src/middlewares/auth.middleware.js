import jwt from "jsonwebtoken";
import sessionModel from "../models/session.js";
import User from "../models/user.js";

async function authenticate(req, res, next) {
  const token = req.cookies.accessToken;
  // Example: Authorization: Bearer <token>
  // const authHeader = req.headers["authorization"]; // get the header
  // const token = authHeader && authHeader.split(" ")[1]; // split by space, take second part

  if (!token) {
    return res.status(401).json({ message: "Token not found please login" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //varify session is exist or not in DB
    const session = await sessionModel.findOne({
      _id: decoded.sessionId,
      revoked: false,
    });
    if (!session) {
      return res
        .status(403)
        .json({ message: "Session expired, please login again" });
    }

    // step 3 — fetch the user and attach to request
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    // req.body attachments
    req.user = user;
    req.userId = user._id;
    req.sessionId = decoded.sessionId;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export default authenticate;
