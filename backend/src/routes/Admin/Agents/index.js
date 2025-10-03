import express from "express";
import {
  getAgents,
  updateAgent,
  deleteAgent
} from "../../../controllers/Admin/AgentController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Using a more RESTful approach for property routes.

router.get(
  "/get-all-agents",
  protect(["admin", "agent", "customer"]),
  getAgents
);

// Update
router.put(
  "/update/:id",
  protect(["admin", "agent", "customer"]),
  updateAgent
);

// Delete
router.delete(
  "/delete/:id",
  protect(["admin", "agent", "customer"]),
  deleteAgent
);

export default router;