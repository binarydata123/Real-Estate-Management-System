import express from "express";
import cors from "cors";
import morgan from "morgan";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";

const app = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.send("Welcome to the Api");
});

// mount all routes under /api
app.use("/api", routes);

// error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
