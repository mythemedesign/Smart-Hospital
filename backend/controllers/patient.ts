import { Response, NextFunction } from 'express';
import { PatientService } from '../services/patient';
import { AppError } from '../middleware/error';
import { CustomRequest } from '../types';
import { PatientInput, PatientUpdateInput } from '../validations/patient';

export const createPatient = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.validatedData || !('name' in req.validatedData)) {
            throw new AppError(400, 'Invalid patient data');
        }
        const patient = await PatientService.create(req.validatedData as PatientInput);
        res.status(201).json(patient);
    } catch (error) {
        next(error);
    }
};

export const updatePatient = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.validatedData || !('email' in req.validatedData)) {
            throw new AppError(400, 'Invalid patient update data');
        }
        const patient = await PatientService.update(req.params.id, req.validatedData as PatientUpdateInput);
        res.json(patient);
    } catch (error) {
        next(error);
    }
};

export const deletePatient = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const result = await PatientService.delete(req.params.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

export const getPatient = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const patient = await PatientService.getById(req.params.id);
        res.json(patient);
    } catch (error) {
        next(error);
    }
};

export const getAllPatients = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const patients = await PatientService.getAll();
        res.json(patients);
    } catch (error) {
        next(error);
    }
};

export const searchPatients = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const name = req.query.name as string;
        if (!name) {
            throw new AppError(400, 'Name parameter is required');
        }
        const patients = await PatientService.searchByName(name);
        res.json(patients);
    } catch (error) {
        next(error);
    }
}; 