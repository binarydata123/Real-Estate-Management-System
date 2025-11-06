import express from "express";
import {
  getCustomers,
  updateCustomer,
  deleteCustomer
} from "../../../controllers/Admin/CustomerController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();



// Using a more RESTful approach for property routes.
// This assumes the router is mounted at a path like `/api/agent/properties`.

router.get(
  "/get-all-customers",
  protect(["admin", "agent", "customer"]),
  getCustomers
);

// Update
router.put(
  "/update/:id",
  protect(["admin", "agent", "customer"]),
  updateCustomer
);

// Delete
router.delete(
  "/delete/:id",
  protect(["admin", "agent", "customer"]),
  deleteCustomer
);

export default router;