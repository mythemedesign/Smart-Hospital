import express from 'express';
import { auth } from '../middleware/auth';
import { getStats } from '../controllers/stats';

const router = express.Router();

// Get dashboard stats (requires authentication)
router.get('/', auth, getStats);

export default router; 