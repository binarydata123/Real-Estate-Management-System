import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import vapiRoutes from "./routes/VAPIRoutes/index.js";
import bodyParser from "body-parser";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// middlewares
app.use(express.json());
app.use(
  cors({
    origin: "*", // or "https://dashboard.vapi.ai" for stricter setup
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(morgan("dev"));
app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("Welcome to the Api");
});

// mount all routes under /api
app.use("/api", routes);
app.use("/api/vapi", vapiRoutes);
app.use("/images", express.static(path.join(__dirname, "storage")));
// error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
