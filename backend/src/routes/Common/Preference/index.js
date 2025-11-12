import express from "express";
import { protect } from "../../../middleware/authMiddleware.js";
import {
    createPreference,
    getPreferenceDetail,
    sendRequestToCustomer
} from '../../../controllers/common/preferencesController.js';
const router = express.Router();

router.post('/', protect(["admin", "agency", "agent", "customer", "AgencyAdmin"]), createPreference);
router.get('/:userId', protect(["admin", "agency", "agent", "customer", "AgencyAdmin"]), getPreferenceDetail);
router.post('/request-to-customer/:id', protect(["admin", "agency", "agent", "customer", "AgencyAdmin"]), sendRequestToCustomer);

export default router;