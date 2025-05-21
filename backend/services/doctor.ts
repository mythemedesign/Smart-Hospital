import Doctor from '../models/Doctor';
import { DoctorInput, DoctorUpdateInput } from '../validations/doctor';
import { AppError } from '../middleware/error';

export class DoctorService {
    static async create(data: DoctorInput) {
        // Check for existing email
        const existingDoctor = await Doctor.findOne({ email: data.email });
        if (existingDoctor) {
            throw new AppError(
                400,
                'Email already exists',
                `A doctor with email ${data.email} already exists`
            );
        }

        const doctor = new Doctor(data);
        await doctor.save();
        return doctor;
    }

    static async update(id: string, data: DoctorUpdateInput) {
        // If email is being updated, check for duplicates
        if (data.email) {
            const existingDoctor = await Doctor.findOne({
                email: data.email,
                _id: { $ne: id }
            });
            if (existingDoctor) {
                throw new AppError(
                    400,
                    'Email already exists',
                    `A doctor with email ${data.email} already exists`
                );
            }
        }

        const doctor = await Doctor.findByIdAndUpdate(
            id,
            { $set: data },
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!doctor) {
            throw new AppError(404, 'Doctor not found');
        }

        return doctor;
    }

    static async delete(id: string) {
        const doctor = await Doctor.findByIdAndDelete(id);
        if (!doctor) {
            throw new AppError(404, 'Doctor not found');
        }
        return { message: 'Doctor deleted successfully' };
    }

    static async getById(id: string) {
        const doctor = await Doctor.findById(id);
        if (!doctor) {
            throw new AppError(404, 'Doctor not found');
        }
        return doctor;
    }

    static async getAll() {
        const doctors = await Doctor.find();
        if (!doctors || doctors.length === 0) {
            throw new AppError(404, 'No doctors found');
        }
        return doctors;
    }

    static async searchByName(name: string) {
        const doctors = await Doctor.find({
            name: { $regex: `.*${name}.*`, $options: 'i' }
        });
        if (!doctors || doctors.length === 0) {
            throw new AppError(404, 'No doctors found');
        }
        return doctors;
    }

    static async getBySpecialty(specialty: string) {
        const doctors = await Doctor.find({ specialty });
        if (!doctors || doctors.length === 0) {
            throw new AppError(404, `No doctors found in ${specialty} specialty`);
        }
        return doctors;
    }

    static async updateAvailableSlots(id: string, slots: Date[]) {
        const doctor = await Doctor.findByIdAndUpdate(
            id,
            { $set: { availableSlots: slots } },
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!doctor) {
            throw new AppError(404, 'Doctor not found');
        }

        return doctor;
    }
} 