import express from "express";
import {
  getAgencies,
  updateAgency,
  deleteAgency,
} from "../../../controllers/Admin/AgenciesController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Read
router.get(
  "/get-all-agencies",
  protect(["admin", "agent", "customer"]),
  getAgencies
);

// Update
router.put(
  "/update/:id",
  protect(["admin", "agent", "customer"]),
  updateAgency
);

// Delete
router.delete(
  "/delete/:id",
  protect(["admin", "agent", "customer"]),
  deleteAgency
);

export default router;