import { Response, NextFunction } from 'express';
import { DoctorService } from '../services/doctor';
import { AppError } from '../middleware/error';
import { CustomRequest } from '../types';
import { DoctorInput, DoctorUpdateInput } from '../validations/doctor';

export const createDoctor = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.validatedData || !('name' in req.validatedData)) {
            throw new AppError(400, 'Invalid doctor data');
        }
        const doctor = await DoctorService.create(req.validatedData as DoctorInput);
        res.status(201).json(doctor);
    } catch (error) {
        next(error);
    }
};

export const updateDoctor = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.validatedData) {
            throw new AppError(400, 'Invalid doctor update data');
        }

        // For PATCH, we only update the fields that are provided
        const updateData = req.validatedData as DoctorUpdateInput;
        const doctor = await DoctorService.update(req.params.id, updateData);

        if (!doctor) {
            throw new AppError(404, 'Doctor not found');
        }

        res.json(doctor);
    } catch (error) {
        next(error);
    }
};

export const deleteDoctor = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await DoctorService.delete(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getDoctor = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const doctor = await DoctorService.getById(req.params.id);
        res.json(doctor);
    } catch (error) {
        next(error);
    }
};

export const getAllDoctors = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const doctors = await DoctorService.getAll();
        res.json(doctors);
    } catch (error) {
        next(error);
    }
};

export const searchDoctors = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const name = req.query.name as string;
        if (!name) {
            throw new AppError(400, 'Name parameter is required');
        }
        const doctors = await DoctorService.searchByName(name);
        res.json(doctors);
    } catch (error) {
        next(error);
    }
}; 