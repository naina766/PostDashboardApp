import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import postRoutes from "./src/modules/posts/post.routes.js";
import { errorHandler } from "./src/middlewares/error.middleware.js";
import path from "path";

dotenv.config();
connectDB();

const app = express();
const __dirname = path.resolve();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(
  "/uploads",
  cors({
    origin: true,
    credentials: true,
  }),
  express.static(path.join(__dirname, "uploads"))
);
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
