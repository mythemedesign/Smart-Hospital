import { z } from 'zod';
import { UserRole } from '../models/User';

export const UserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['admin', 'doctor', 'staff'] as const).default('staff')
});

export const UserUpdateSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    role: z.enum(['admin', 'doctor', 'staff'] as const).optional()
});

export type UserInput = z.infer<typeof UserSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>; 