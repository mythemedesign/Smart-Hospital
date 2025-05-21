import { Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment';
import { AppError } from '../middleware/error';
import { CustomRequest } from '../types';
import { AppointmentInput, AppointmentUpdateInput } from '../validations/appointment';
import Appointment from '../models/Appointment';
import { IAppointment } from '../models/Appointment';

export const createAppointment = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.validatedData || !('patientId' in req.validatedData)) {
            throw new AppError(400, 'Invalid appointment data');
        }
        const appointment = await AppointmentService.create(req.validatedData as AppointmentInput);
        res.status(201).json(appointment);
    } catch (error) {
        next(error);
    }
};

export const updateAppointment = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.validatedData) {
            throw new AppError(400, 'Invalid appointment update data');
        }

        const updateData = req.validatedData as AppointmentUpdateInput;
        const appointment = await AppointmentService.update(req.params.id, updateData);

        if (!appointment) {
            throw new AppError(404, 'Appointment not found');
        }

        res.json(appointment);
    } catch (error) {
        next(error);
    }
};

export const deleteAppointment = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await AppointmentService.delete(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getAppointment = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const appointment = await AppointmentService.getById(req.params.id);
        res.json(appointment);
    } catch (error) {
        next(error);
    }
};

export const getAllAppointments = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const appointments = await AppointmentService.getAll();
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

export const getDoctorAppointments = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const doctorId = req.params.doctorId;
        if (!doctorId) {
            throw new AppError(400, 'Doctor ID is required');
        }
        const appointments = await AppointmentService.getByDoctor(doctorId);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

export const getPatientAppointments = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const patientId = req.params.patientId;
        if (!patientId) {
            throw new AppError(400, 'Patient ID is required');
        }
        const appointments = await AppointmentService.getByPatient(patientId);
        res.json(appointments);
    } catch (error) {
        next(error);
    }
};

export const updateAppointmentStatus = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { status } = req.body;
        if (!status) {
            throw new AppError(400, 'Status is required');
        }
        const appointment = await AppointmentService.updateStatus(req.params.id, status);
        res.json(appointment);
    } catch (error) {
        next(error);
    }
};

export const getRecentAppointments = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            days = 30, // Default to 7 days
            limit = 10, // Default to 10 appointments
            status, // Optional status filter
            doctorId, // Optional doctor filter
            patientId, // Optional patient filter
            upcoming = true // Optional upcoming appointments filter
        } = req.query;

        // Calculate date range
        const startDate = new Date(); //today
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + Number(days));

        // Build query
        const query: any = {
            date: {
                $gte: startDate,
                $lte: endDate
            }
        };

        // Add optional filters
        if (status) query.status = status;
        if (doctorId) query.doctorId = doctorId;
        if (patientId) query.patientId = patientId;

        // If upcoming is true, only show future appointments
        if (upcoming === 'true') {
            query.date.$gte = new Date(); // Only future dates
        }

        const appointments = await Appointment.find(query)
            .sort({ date: upcoming === 'true' ? 1 : -1, time: upcoming === 'true' ? 1 : -1 }) // Sort by date and time
            .limit(Number(limit))
            .populate('doctorId', 'name specialty email phone')
            .populate('patientId', 'name age status gender phone email');

        // Get total count for pagination
        const totalCount = await Appointment.countDocuments(query);

        // Format the appointments
        const formattedAppointments = appointments.map((appointment: IAppointment & { doctorId: any; patientId: any }) => ({
            _id: appointment._id,
            doctorId: appointment.doctorId ? {
                name: appointment.doctorId.name,
                specialty: appointment.doctorId.specialty,
            } : null,
            patientId: appointment.patientId ? {
                name: appointment.patientId.name,
            } : null,
            date: appointment.date,
            time: appointment.time,
            status: appointment.status,
        }));

        // Get status counts for the same period
        const statusCounts = await Appointment.aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        res.json(formattedAppointments);
    } catch (error) {
        next(error);
    }
}; 