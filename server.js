import { config } from "dotenv";
config();

import express from "express";
import cookieParser from "cookie-parser";

import authRoutes from "./src/routers/auth.routes.js";
import workSpaceRoutes from "./src/routers/workspace.routes.js";
import projectRoutes from "./src/routers/project.routes.js";
import taskRoutes from "./src/routers/task.routes.js";
import connectDB from "./src/db/db.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

connectDB();

app.get("/", (req, res) => {
  res.send("API working...");
});

app.use("/auth", authRoutes);
app.use("/api", workSpaceRoutes);
app.use("/api", projectRoutes);
app.use("/api", taskRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
