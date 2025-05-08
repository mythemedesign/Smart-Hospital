import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import patientRoutes from "../routers/patients";
import appointmentRoutes from "../routers/appointments";
import doctorRoutes from "../routers/doctors";

dotenv.config();
const app = express();

// Define Port
const port = process.env.PORT;
if (!port) {
	throw new Error("Port not defined");
}

// CORS configuration
const corsOptions = {
	origin: process.env.CLIENT_URL,
	methods: ["GET", "POST", "PUT", "DELETE"],
	credentials: true,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

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

app.get("/", async (req: Request, res: Response) => {
	res.send("<h1>Hello, Smart Hospital is Here!</h1>");
});

// Start the server
app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
