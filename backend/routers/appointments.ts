import express, { Request, Response, Router } from "express";
import Appointment from "../models/Appointment";

const router: Router = express.Router();

// Get all appointments
router.get("/", async (req: Request, res: Response) => {
	try {
		const appointments = await Appointment.find();
		if (!appointments || appointments.length === 0) {
			return res.status(404).json({ error: "Appointment not found" });
		}
		res.json(appointments);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch appointments" });
	}
});

// Search for appointments by name
router.get("/search", async (req: Request, res: Response) => {
	try {
		const name = req.query.name;
		const appointments = await Appointment.find({
			name: { $regex: `.*${name}.*`, $options: "i" },
		});
		if (!appointments || appointments.length === 0) {
			return res.status(404).json({ error: "Appointment not found" });
		}
		res.json(appointments);
	} catch (err) {
		res.status(500).json({ error: "Failed to search appointments" });
	}
});

// find a Appointment by ID
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) {
			return res.status(404).json({ error: "Appointment not found" });
		}
		res.json(appointment);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch appointment" });
	}
});

// Create a appointment
router.post("/", async (req: Request, res: Response) => {
	try {
		// Validate request body codes here

		const appointment = new Appointment(req.body);
		await appointment.save();
		res.status(201).json(appointment);
	} catch (err) {
		res.status(400).json({ error: "Failed to create appointment" });
	}
});

// Update an appointment
router.put("/:id", async (req: Request, res: Response) => {
	try {
		const appointment = await Appointment.findByIdAndUpdate(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true,
			}
		);
		if (!appointment) {
			return res.status(404).json({ error: "Appointment not found" });
		}
		res.json(appointment);
	} catch (err) {
		res.status(400).json({ error: "Failed to update appointment" });
	}
});

// Delete a appointment
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const appointment = await Appointment.findByIdAndDelete(req.params.id);
		if (!appointment) {
			return res.status(404).json({ error: "Appointment not found" });
		}
		res.json({ message: "Appointment deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: "Failed to delete appointment" });
	}
});

export default router;
