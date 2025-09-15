import express from 'express';
import registrationController from '../../controllers/Authentication/authController.js';
import { protect } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register-agency', registrationController.registerAgency);
router.post('/login', registrationController.loginUser);
router.get('/check-session', protect, registrationController.checkSession);

export default router;
