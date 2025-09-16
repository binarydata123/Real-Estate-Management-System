import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  getCustomers,
  updateCustomer,
} from "../../../controllers/Agent/CustomerController.js";

const router = express.Router();

// Create
router.post("/create", createCustomer);

// Read
router.get("/get-all", getCustomers);
router.get("/getById/:id", getCustomerById);

// Update
router.put("/update/:id", updateCustomer);

// Delete
router.delete("/delete/:id", deleteCustomer);

export default router;
