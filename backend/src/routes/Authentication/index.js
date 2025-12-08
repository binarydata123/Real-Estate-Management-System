import express from "express";
import registrationController from "../../controllers/Authentication/authController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register-agency", registrationController.registerAgency);
router.post("/login", registrationController.loginUser);
router.post(
  "/select-customer-agency",
  registrationController.selectCustomerAgency
);
router.get(
  "/check-session",
  protect(["agent", "admin", "customer"]),
  registrationController.checkSession
);
router.post(
  "/select-customer-agency",
  registrationController.selectCustomerAgency
);
router.get(
  "/check-session",
  protect(["agent", "admin", "customer"]),
  registrationController.checkSession
);
router.post(
  "/change-password",
  protect(["agent", "admin", "customer"]),
  registrationController.changePassword
);
router.post(
  "/check-otp",
  registrationController.otpHandler
);
router.post(
  "/otp",
  registrationController.otpGenerator
);

export default router;
