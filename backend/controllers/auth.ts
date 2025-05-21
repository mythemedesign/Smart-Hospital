import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from '../middleware/error';
import { CustomRequest } from '../types';
import { UserInput, UserUpdateInput } from '../validations/user';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT secret not defined');
}

export const login = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError(401, 'Invalid credentials');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError(401, 'Invalid credentials');
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: '24h',
        });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.user?.id).select('-password');
        if (!user) {
            throw new AppError(404, 'User not found');
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
};

export const createUser = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.validatedData || !('email' in req.validatedData)) {
            throw new AppError(400, 'Invalid user data');
        }

        const existingUser = await User.findOne({ email: req.validatedData.email });
        if (existingUser) {
            throw new AppError(400, 'Email already exists');
        }

        const user = new User(req.validatedData as UserInput);
        await user.save();

        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.validatedData) {
            throw new AppError(400, 'Invalid user update data');
        }

        const updateData = req.validatedData as UserUpdateInput;
        const user = await User.findById(req.params.id);

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        // Update only provided fields
        if (updateData.name) user.name = updateData.name;
        if (updateData.email) user.email = updateData.email;
        // if (updateData.role) user.role = updateData.role;

        await user.save();

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new AppError(404, 'User not found');
        }

        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
}; 