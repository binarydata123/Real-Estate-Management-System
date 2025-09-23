import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
  inviteAgent,
  getAgents,
} from "../../../controllers/Agent/InviteAgentController.js";

const router = express.Router();

router.post(
  "/create",
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  inviteAgent
);

router.get(
  "/",
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  getAgents
);

export default router;
