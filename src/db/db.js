import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected🚀");
  } catch (error) {
    console.error("Error in DB connection", error);
  }
}

export default connectDB;
