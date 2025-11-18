import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import routes from "./routes/index.js";
import { Server } from "socket.io";
import http from "http";
import vapiRoutes from "./routes/VAPIRoutes/index.js";
import bodyParser from "body-parser";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // join conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);
    io.emit("joined", conversationId);
  });

  // send message
  socket.on("send_message", async (conversationId) => {
    console.log(conversationId, "send message received");
    io.to(conversationId).emit("messages_update", conversationId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

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

export default server;
