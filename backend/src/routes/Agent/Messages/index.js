import express from "express";
import { body } from "express-validator";
import {
  getConversations, 
  getConversationMessages,  
  sendMessage, 
  startConversation, 
  markConversationAsRead, 
  archiveConversation, 
  unArchiveConversation, 
  deleteConversation,
  restoreConversation,
  blockConversation,
  unblockConversation,
  getLatestMessages,
  getCustomers
} from "../../../controllers/Agent/messageController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const messageUploadDir = path.resolve(process.cwd(), "../backend/src/uploads/messages");
if (!fs.existsSync(messageUploadDir)) {
  fs.mkdirSync(messageUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, messageUploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/messages/${req.file.filename}`;
  res.json({
    success: true,
    file: {
      name: req.file.originalname,
      url: fileUrl,
      type: req.file.mimetype,
      size: req.file.size,
    },
  });
});

router.get("/conversations", protect(["admin", "agent"]), getConversations);
router.get("/conversations/:id", protect(["admin", "agent"]), getConversationMessages);

router.post(
  "/conversations/:id",
  [
    body().custom((body) => {
      const hasContent = typeof body.content === "string" && body.content.trim().length > 0;
      const hasAttachments = Array.isArray(body.attachments) && body.attachments.length > 0;
      if (!hasContent && !hasAttachments) {
        throw new Error("Message must have text content or at least one attachment");
      }
      return true;
    }),
  ],
  protect(["admin", "agent"]),
  sendMessage
);

router.post(
  "/conversations",
  [body("receiverId").notEmpty().withMessage("Receiver ID is required")],
  protect(["admin", "agent"]),
  startConversation
);

router.patch("/conversations/:id/read", protect(["admin", "agent"]), markConversationAsRead);
router.patch("/conversations/:id/archive", protect(["admin", "agent"]), archiveConversation);
router.patch("/conversations/:id/unarchive", protect(["admin", "agent"]), unArchiveConversation);
router.patch("/conversations/:id/delete", protect(["admin", "agent"]), deleteConversation);
router.patch("/conversations/:id/restore", protect(["admin", "agent"]), restoreConversation);
router.patch("/conversations/:id/block", protect(["admin", "agent"]), blockConversation);
router.patch("/conversations/:id/unblock", protect(["admin", "agent"]), unblockConversation);
router.get("/latestMessages", protect(["admin", "agent"]), getLatestMessages);

router.get("/get-customers", protect(["admin", "agent"]), getCustomers);

export default router;
