import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import serverless from "serverless-http";
import usersRoutes from "./routes/userRoutes.js";
import commentsRoutes from "./routes/commentRoutes.js";

const app = express();
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/comments", commentsRoutes);

export const handler = serverless(app);
