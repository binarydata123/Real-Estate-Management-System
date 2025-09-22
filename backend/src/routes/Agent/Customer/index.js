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

router.post(
  "/create",
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  createCustomer
);
getCustomersForDropDown;

// Read
router.get(
  "/get-all",
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  getCustomers
);
router.get(
  "/get-all-for-dropDown",
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  getCustomersForDropDown
);

// Update
router.put(
  "/update/:id",
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  updateCustomer
);

// Delete
router.delete(
  "/delete/:id",
  protect(["admin", "agency", "agent", "AgencyAdmin"]),
  deleteCustomer
);

export default router;
