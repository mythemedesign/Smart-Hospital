import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from "mongoose";
import dotenv from "dotenv";

import { errorHandler } from './middleware/error';

import patientRoutes from './routes/patient';
import appointmentRoutes from "./routes/appointments";
import doctorRoutes from "./routes/doctor";
import userRoutes from "./routes/auth"
import statsRouter from "./routes/stats"
const app = express();
dotenv.config();

// Middleware
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS configuration
app.use(cors({
    // origin: [
    //     'http://localhost:5173',    // Vite dev server
    //     'http://localhost',         // Frontend container
    //     'http://localhost:80',      // Frontend container with port
    //     'http://127.0.0.1',         // Alternative localhost
    //     'http://127.0.0.1:80'       // Alternative localhost with port
    // ],
    origin: '*',
    credentials: true,  // Allow credentials (cookies, authorization headers, etc)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Define Port
const port = process.env.PORT;
if (!port) {
	throw new Error("Port not defined");
}

// MongoDB connection
const dbURI = process.env.MONGODB_URI;
if (!dbURI) {
	throw new Error("MongoDB URI not defined");
}
mongoose
	.connect(dbURI)
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.log(err));

// Routes
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", userRoutes)
app.use('/api/stats', statsRouter); 

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        details: 'The requested resource was not found'
    });
});

// Start the server
app.listen(port, () => {
	console.log(`Server is running at ${process.env.CLIENT_URL}`);
});