import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  getCustomersForDropDown,
  updateCustomer,
} from "../../../controllers/Agent/CustomerController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();

// Create

router.post("/create", protect(["admin", "agent"]), createCustomer);

// Read
router.get("/get-all", protect(["admin", "agent"]), getCustomers);
router.get(
  "/get-all-for-dropDown",
  // protect(["admin", "agent"]),
  getCustomersForDropDown
);

// Update
router.put("/update/:id", protect(["admin", "agent"]), updateCustomer);

// Delete
router.delete("/delete/:id", protect(["admin", "agent"]), deleteCustomer);

export default router;
