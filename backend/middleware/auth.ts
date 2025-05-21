import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, UserRole, IUser } from "../models/User";
import dotenv from "dotenv";

dotenv.config()

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: UserRole;
            };
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET;
if(!JWT_SECRET){
    throw new Error("JWT secret is not defined")
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const user = await User.findById(decoded.id).exec();

        if (!user) {
            throw new Error();
        }

        if (!user || typeof user !== "object" || !("_id" in user) || !("role" in user)) {
            throw new Error("Invalid user object");
        }

        req.user = {
            id: String((user as { _id: any })._id),
            role: (user as { role: UserRole }).role,
        };

        next();
    } catch (error) {
        res.status(401).json({ error: "Please authenticate." });
    }
};

export const requireRole = (roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: "Please authenticate." });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied." });
        }

        next();
    };
}; 