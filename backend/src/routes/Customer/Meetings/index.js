import express from "express";
import {
  getMeetingById,
  getMeetingsByCustomer
} from "../../../controllers/Customer/MeetingsController.js";
import { protect } from "../../../middleware/authMiddleware.js";

const router = express.Router();



// Read
router.get(
  "/get-all",
  protect(["admin", "customer"]),
  getMeetingsByCustomer
);
router.get(
  "/getById/:id",
  protect(["admin", "customer"]),
  getMeetingById
);



export default router;
