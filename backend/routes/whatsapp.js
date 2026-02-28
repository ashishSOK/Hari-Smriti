import express from 'express';
import {
    sendWhatsAppMessage,
    sendBulkWhatsAppMessages,
    sendReminderToMissingDevotees
} from '../controllers/whatsappController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// All WhatsApp routes are for mentors only
router.use(protect);
router.use(authorizeRoles('mentor'));

router.post('/send', sendWhatsAppMessage);
router.post('/send-bulk', sendBulkWhatsAppMessages);
router.post('/send-reminder', sendReminderToMissingDevotees);

export default router;
