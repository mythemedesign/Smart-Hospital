import Patient from '../models/Patient';
import { PatientInput, PatientUpdateInput } from '../validations/patient';
import { AppError } from '../middleware/error';

export class PatientService {
    static async create(data: PatientInput) {
        // Check for existing email
        const existingPatient = await Patient.findOne({ email: data.email });
        if (existingPatient) {
            throw new AppError(
                400,
                'Email already exists',
                `A patient with email ${data.email} already exists`
            );
        }

        const patient = new Patient(data);
        await patient.save();
        return patient;
    }

    static async update(id: string, data: PatientUpdateInput) {
        // If email is being updated, check for duplicates
        if (data.email) {
            const existingPatient = await Patient.findOne({
                email: data.email,
                _id: { $ne: id }
            });
            if (existingPatient) {
                throw new AppError(
                    400,
                    'Email already exists',
                    `A patient with email ${data.email} already exists`
                );
            }
        }

        const patient = await Patient.findByIdAndUpdate(
            id,
            { $set: data },
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!patient) {
            throw new AppError(404, 'Patient not found');
        }

        return patient;
    }

    static async delete(id: string) {
        const patient = await Patient.findByIdAndDelete(id);
        if (!patient) {
            throw new AppError(404, 'Patient not found');
        }
        return { message: 'Patient deleted successfully' };
    }

    static async getById(id: string) {
        const patient = await Patient.findById(id);
        if (!patient) {
            throw new AppError(404, 'Patient not found');
        }
        return patient;
    }

    static async getAll() {
        const patients = await Patient.find();
        if (!patients || patients.length === 0) {
            throw new AppError(404, 'No patients found');
        }
        return patients;
    }

    static async searchByName(name: string) {
        const patients = await Patient.find({
            name: { $regex: `.*${name}.*`, $options: 'i' }
        });
        if (!patients || patients.length === 0) {
            throw new AppError(404, 'No patients found');
        }
        return patients;
    }
} 