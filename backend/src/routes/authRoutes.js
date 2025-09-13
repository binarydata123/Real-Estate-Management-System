import express from 'express';
import registrationController from '../controllers/Authentication/authController.js';

const router = express.Router();

router.post('/register-agency', registrationController.registerAgency);

export default router;
