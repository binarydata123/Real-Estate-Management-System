import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import connectDB from "./config/db.js";
import app from "./app.js";
import { startCronJob } from "./cronJob/StartCronJob.js";

// load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// connect db
connectDB();

startCronJob();
// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
