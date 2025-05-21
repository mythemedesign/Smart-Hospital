import { Request } from 'express';
import { PatientInput, PatientUpdateInput } from '../validations/patient';
import { AppointmentInput, AppointmentUpdateInput } from '../validations/appointment';
import { DoctorInput, DoctorUpdateInput } from '../validations/doctor';

export type ValidatedData = PatientInput | PatientUpdateInput | AppointmentInput | AppointmentUpdateInput | DoctorInput | DoctorUpdateInput;

export interface AuthenticatedUser {
    id: string;
    role: string;
}

export interface CustomRequest extends Request {
    validatedData?: ValidatedData;
    user?: AuthenticatedUser;
}

// This export is needed to make this file a module
export {}; 