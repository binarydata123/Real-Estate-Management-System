import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  inviteAgent,
  getAgents,
} from "../../../controllers/Agent/InviteAgentController.js";

const router = express.Router();

router.post(
  "/create",
  protect(["admin", "agent"]),
  inviteAgent
);

router.get(
  "/",
  protect(["admin", "agent"]),
  getAgents
);

export default router;
