import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";

import {
  inviteAgent,
  getAgents,
  getTeamMembers,
  deleteTeamMember,
  updateAgent,
} from "../../../controllers/Agent/InviteAgentController.js";

const router = express.Router();

router.post("/create", protect(["admin", "agent"]), inviteAgent);

router.get("/", protect(["admin", "agent"]), getAgents);
router.get("/team-members", getTeamMembers);
router.delete("/:id",deleteTeamMember);
router.put("",updateAgent);
export default router;
