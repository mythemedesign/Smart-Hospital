import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import patientRoutes from "../routers/patients";
import appointmentRoutes from "../routers/appointments";
import doctorRoutes from "../routers/doctors";

dotenv.config();
const app = express();
const port = process.env.PORT as string;
const corsOptions = {
	origin: process.env.CLIENT_URL,
	methods: ["GET", "POST", "PUT", "DELETE"],
	credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
const dbURI = process.env.MONGODB_URI as string;
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

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
