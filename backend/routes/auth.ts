import express from "express";
import { auth, requireRole } from "../middleware/auth";
import { validate } from '../middleware/validation';
import { UserSchema, UserUpdateSchema } from '../validations/user';
import {
    login,
    getCurrentUser,
    createUser,
    getAllUsers,
    updateUser,
    deleteUser
} from '../controllers/auth';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
	throw new Error("JWT secret not defined");
}

// Login route
router.post("/login", login);

// Get current user
router.get("/me", auth, getCurrentUser);

// Create new user (admin only)
router.post("/users", auth, requireRole(["admin"]), validate(UserSchema), createUser);

// Get all users (admin only)
router.get("/users", auth, requireRole(["admin"]), getAllUsers);

// Update user (admin only)
router.patch("/users/:id", auth, requireRole(["admin"]), validate(UserUpdateSchema), updateUser);

// Delete user (admin only)
router.delete("/users/:id", auth, requireRole(["admin"]), deleteUser);

export default router; 