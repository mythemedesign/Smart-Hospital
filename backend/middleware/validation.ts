import { Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { CustomRequest } from '../types';

export const validate = (schema: AnyZodObject) => {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
        try {
            const result = await schema.safeParseAsync(req.body);
            if (!result.success) {
                const errors = result.error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors
                });
            }
            req.validatedData = result.data;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(err => ({
                        path: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
}; 