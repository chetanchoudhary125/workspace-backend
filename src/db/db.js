import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected🚀");
  } catch (error) {
    res.status(500).json({
        message:"Error in DB connection",
        error: error.message
    })
  }
}

export default connectDB
