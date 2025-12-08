import express from "express";
import {
  getTeamMembers,
  updateTeamMember,
  deleteTeamMember
} from "../../../controllers/Admin/TeamMembersController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Using a more RESTful approach for property routes.

router.get(
  "/get-all-team-members",
  protect(["admin", "agent", "customer"]),
  getTeamMembers
);

// Update
router.put(
  "/update/:id",
  protect(["admin", "agent", "customer"]),
  updateTeamMember
);

// Delete
router.delete(
  "/delete/:id",
  protect(["admin", "agent", "customer"]),
  deleteTeamMember
);

export default router;