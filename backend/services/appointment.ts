import Appointment from '../models/Appointment';
import Doctor from '../models/Doctor';
import { AppointmentInput, AppointmentUpdateInput } from '../validations/appointment';
import { AppError } from '../middleware/error';

export class AppointmentService {
    static async create(data: AppointmentInput) {
        // Check if doctor exists and is available at the requested time
        const doctor = await Doctor.findById(data.doctorId);
        if (!doctor) {
            throw new AppError(404, 'Doctor not found');
        }

        // Check for scheduling conflicts
        const existingAppointment = await Appointment.findOne({
            doctorId: data.doctorId,
            date: data.date,
            time: data.time,
            status: { $ne: 'cancelled' }
        });

        if (existingAppointment) {
            throw new AppError(
                400,
                'Scheduling conflict',
                'Doctor already has an appointment scheduled at this time'
            );
        }

        const appointment = new Appointment(data);
        await appointment.save();
        return appointment;
    }

    static async update(id: string, data: AppointmentUpdateInput) {
        // If time/date is being updated, check for scheduling conflicts
        if (data.doctorId || data.date || data.time) {
            const existingAppointment = await Appointment.findOne({
                doctorId: data.doctorId,
                date: data.date,
                time: data.time,
                _id: { $ne: id },
                status: { $ne: 'cancelled' }
            });

            if (existingAppointment) {
                throw new AppError(
                    400,
                    'Scheduling conflict',
                    'Doctor already has an appointment scheduled at this time'
                );
            }
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { $set: data },
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!appointment) {
            throw new AppError(404, 'Appointment not found');
        }

        return appointment;
    }

    static async delete(id: string) {
        const appointment = await Appointment.findByIdAndDelete(id);
        if (!appointment) {
            throw new AppError(404, 'Appointment not found');
        }
        return { message: 'Appointment deleted successfully' };
    }

    static async getById(id: string) {
        const appointment = await Appointment.findById(id)
            .populate('doctorId', 'name specialty')
            .populate('patientId', 'name email');
            
        if (!appointment) {
            throw new AppError(404, 'Appointment not found');
        }
        return appointment;
    }

    static async getAll() {
        const appointments = await Appointment.find()
            .populate('doctorId', 'name specialty')
            .populate('patientId', 'name email');
            
        if (!appointments || appointments.length === 0) {
            throw new AppError(404, 'No appointments found');
        }
        
        return appointments;
    }

    static async getByDoctor(doctorId: string) {
        const appointments = await Appointment.find({ doctorId })
            .populate('doctorId', 'name specialty')
            .populate('patientId', 'name email')
            .sort({ date: 1, time: 1 });
            
        if (!appointments || appointments.length === 0) {
            throw new AppError(404, 'No appointments found for this doctor');
        }
        return appointments;
    }

    static async getByPatient(patientId: string) {
        const appointments = await Appointment.find({ patientId })
            .populate('doctorId', 'name specialty')
            .populate('patientId', 'name email')
            .sort({ date: 1, time: 1 });
            
        if (!appointments || appointments.length === 0) {
            throw new AppError(404, 'No appointments found for this patient');
        }
        return appointments;
    }

    static async getByDate(date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        })
        .populate('doctorId', 'name specialty')
        .populate('patientId', 'name email')
        .sort({ time: 1 });

        if (!appointments || appointments.length === 0) {
            throw new AppError(404, 'No appointments found for this date');
        }
        return appointments;
    }

    static async updateStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled') {
        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { $set: { status } },
            {
                new: true,
                runValidators: true,
                context: 'query'
            }
        );

        if (!appointment) {
            throw new AppError(404, 'Appointment not found');
        }

        return appointment;
    }

    static async getUpcomingAppointments(limit: number = 10) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const appointments = await Appointment.find({
            date: { $gte: today },
            status: { $ne: 'cancelled' }
        })
        .populate('doctorId', 'name specialty')
        .populate('patientId', 'name email')
        .sort({ date: 1, time: 1 })
        .limit(limit);

        if (!appointments || appointments.length === 0) {
            throw new AppError(404, 'No upcoming appointments found');
        }
        return appointments;
    }
} 