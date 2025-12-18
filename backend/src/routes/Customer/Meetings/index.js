import express from "express";
import {
  getMeetingById,
  getMeetingsByCustomer,
  updateMeetingByCustomer,
  updateMeetingStatusByCustomer,
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


router.put(
  "/update-status/:id",
  protect(["admin", "customer"]),
  updateMeetingStatusByCustomer
);

router.put(
  "/update/:id",
  protect(["admin", "customer"]),
  updateMeetingByCustomer
);


export default router;
