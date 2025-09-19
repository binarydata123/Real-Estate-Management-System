import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  getCustomersForDropDown,
  updateCustomer,
} from "../../../controllers/Agent/CustomerController.js";

const router = express.Router();

// Create
router.post("/create", createCustomer);
getCustomersForDropDown;

// Read
router.get("/get-all", getCustomers);
router.get("/get-all-for-dropDown", getCustomersForDropDown);

// Update
router.put("/update/:id", updateCustomer);

// Delete
router.delete("/delete/:id", deleteCustomer);

export default router;
