import { Router } from 'express';
import { validate } from '../middleware/validation';
import { PatientSchema, PatientUpdateSchema } from '../validations/patient';
import {
    createPatient,
    updatePatient,
    deletePatient,
    getPatient,
    getAllPatients,
    searchPatients
} from '../controllers/patient';

const router = Router();

// Get all patients
router.get('/', getAllPatients);

// Search patients by name
router.get('/search', searchPatients);

// Get patient by ID
router.get('/:id', getPatient);

// Create new patient
router.post('/', validate(PatientSchema), createPatient);

// Update patient
router.put('/:id', validate(PatientUpdateSchema), updatePatient);


router.patch('/:id', validate(PatientUpdateSchema), updatePatient);
// Delete patient
router.delete('/:id', deletePatient);

export default router; 