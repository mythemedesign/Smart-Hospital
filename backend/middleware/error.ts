import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public details?: any
    ) {
        super(message);
        this.name = 'AppError';
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error:', err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            details: err.details
        });
    }

    // Handle Mongoose errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: Object.values((err as any).errors).map((e: any) => ({
                field: e.path,
                message: e.message
            }))
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            error: 'Invalid ID format',
            details: 'The provided ID is not valid'
        });
    }

    // Handle duplicate key errors
    if ((err as any).code === 11000) {
        const field = Object.keys((err as any).keyPattern)[0];
        return res.status(400).json({
            error: 'Duplicate value',
            details: `A record with this ${field} already exists`
        });
    }

    // Default error
    return res.status(500).json({
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
}; 