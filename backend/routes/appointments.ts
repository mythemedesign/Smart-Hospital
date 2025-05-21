import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { AppointmentSchema, AppointmentUpdateSchema } from '../validations/appointment';
import {
	createAppointment,
	updateAppointment,
	deleteAppointment,
	getAppointment,
	getAllAppointments,
	getDoctorAppointments,
	getPatientAppointments,
	updateAppointmentStatus,
	getRecentAppointments
} from '../controllers/appointment';

const router = express.Router();

// Get all appointments
router.get('/', auth, getAllAppointments);

// Get recent appointments
router.get('/recent', auth, getRecentAppointments);

// Get appointments by doctor
router.get('/doctor/:doctorId', auth, getDoctorAppointments);

// Get appointments by patient
router.get('/patient/:patientId', auth, getPatientAppointments);

// Get appointment by ID
router.get('/:id', auth, getAppointment);

// Create new appointment
router.post('/', auth, validate(AppointmentSchema), createAppointment);

// Update appointment
router.patch('/:id', auth, validate(AppointmentUpdateSchema), updateAppointment);

// Update appointment status
router.patch('/:id/status', auth, updateAppointmentStatus);

// Delete appointment (admin only)
router.delete('/:id', auth, requireRole(['admin']), deleteAppointment);

export default router;
