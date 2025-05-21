import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { DoctorSchema, DoctorUpdateSchema } from '../validations/doctor';
import {
	createDoctor,
	updateDoctor,
	deleteDoctor,
	getDoctor,
	getAllDoctors,
	searchDoctors
} from '../controllers/doctor';

const router = express.Router();

// Get all doctors
router.get('/', getAllDoctors);

// Search doctors by name
router.get('/search', searchDoctors);

// Get doctor by ID
router.get('/:id', getDoctor);

// Create new doctor (admin only)
router.post('/', auth, requireRole(['admin']), validate(DoctorSchema), createDoctor);

// Update doctor (admin only)
router.patch('/:id', auth, requireRole(['admin']), validate(DoctorUpdateSchema), updateDoctor);

// Delete doctor (admin only)
router.delete('/:id', auth, requireRole(['admin']), deleteDoctor);

export default router;
