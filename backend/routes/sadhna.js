import express from 'express';
import {
    createOrUpdateEntry,
    getMyEntries,
    getDevoteesEntries,
    getWeeklyWinner,
    getMonthlyWinner,
    getDevoteeHistory,
    deleteEntry,
    getMissingSubmissions,
    getWeeklyAttendance,
    getMonthlyAttendance,
    getPeerDevoteesEntries,
    getPeerDevoteeHistory,
    getPeerDevotees
} from '../controllers/sadhnaController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { sadhnaEntryValidation } from '../utils/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for all authenticated users
router.post('/', sadhnaEntryValidation, createOrUpdateEntry);
router.get('/my-entries', getMyEntries);
router.delete('/:id', deleteEntry);

// Routes for mentors only
router.get('/devotees-entries', authorizeRoles('mentor'), getDevoteesEntries);
router.get('/devotee-history/:userId', authorizeRoles('mentor'), getDevoteeHistory);
router.get('/weekly-winner', authorizeRoles('mentor'), getWeeklyWinner);
router.get('/monthly-winner', authorizeRoles('mentor'), getMonthlyWinner);
router.get('/missing-submissions', authorizeRoles('mentor'), getMissingSubmissions);
router.get('/weekly-attendance', authorizeRoles('mentor'), getWeeklyAttendance);
router.get('/monthly-attendance', authorizeRoles('mentor'), getMonthlyAttendance);

// Routes for devotees only (peer group view)
router.get('/peer-devotees', authorizeRoles('devotee'), getPeerDevotees);
router.get('/peer-entries', authorizeRoles('devotee'), getPeerDevoteesEntries);
router.get('/peer-history/:userId', authorizeRoles('devotee'), getPeerDevoteeHistory);

export default router;

