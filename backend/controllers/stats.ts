import { Response, NextFunction } from 'express';
import { CustomRequest } from '../types';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Appointment from '../models/Appointment';
import { AppError } from '../middleware/error';

export const getStats = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get counts in parallel for better performance
        const [doctorCount, patientCount, appointmentCount, todayAppointmentCount] = await Promise.all([
            Doctor.countDocuments(),
            Patient.countDocuments(),
            Appointment.countDocuments(),
            Appointment.countDocuments({
                date: {
                    $gte: today,
                    $lt: tomorrow
                }
            })
        ]);

        res.json({
            doctors: doctorCount,
            patients: patientCount,
            appointments: appointmentCount,
            todayAppointments: todayAppointmentCount
        });
    } catch (error) {
        next(error);
    }
}; 