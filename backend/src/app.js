import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Welcome to the Api");
});

// mount all routes under /api
app.use("/api", routes);
app.use("/images", express.static(path.join(__dirname, "storage")));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".m3u8")) {
        res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
      }
      if (filePath.endsWith(".ts")) {
        res.setHeader("Content-Type", "video/mp2t");
      }
      // Allow CORS so frontend (5173) can load HLS segments
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
