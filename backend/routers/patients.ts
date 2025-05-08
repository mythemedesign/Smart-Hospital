import express, { Request, Response, Router } from "express";
import Patient from "../models/Patient";

const router: Router = express.Router();

// Get all patients
router.get("/", async (req: Request, res: Response) => {
	try {
		const patients = await Patient.find();
		if (!patients || patients.length === 0) {
			return res.status(404).json({ error: "Patient not found" });
		}
		res.json(patients);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch patients" });
	}
});

// Search for patients by name
router.get("/search", async (req: Request, res: Response) => {
	try {
		const name = req.query.name;
		const patients = await Patient.find({
			name: { $regex: `.*${name}.*`, $options: "i" },
		});
		if (!patients || patients.length === 0) {
			return res.status(404).json({ error: "Patient not found" });
		}
		res.json(patients);
	} catch (err) {
		res.status(500).json({ error: "Failed to search patients" });
	}
});

// find a Patient by ID
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const patient = await Patient.findById(req.params.id);
		if (!patient) {
			return res.status(404).json({ error: "Patient not found" });
		}
		res.json(patient);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch patient" });
	}
});

// Create a patient
router.post("/", async (req: Request, res: Response) => {
	try {
		// Validate request body codes here

		const patient = new Patient(req.body);
		await patient.save();
		res.status(201).json(patient);
	} catch (err) {
		res.status(400).json({ error: "Failed to create patient" });
	}
});

// Update a patient
router.put("/:id", async (req: Request, res: Response) => {
	try {
		const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!patient) {
			return res.status(404).json({ error: "Patient not found" });
		}
		res.json(patient);
	} catch (err) {
		res.status(400).json({ error: "Failed to update patient" });
	}
});

// Delete a patient
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const patient = await Patient.findByIdAndDelete(req.params.id);
		if (!patient) {
			return res.status(404).json({ error: "Patient not found" });
		}
		res.json({ message: "Patient deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: "Failed to delete patient" });
	}
});

export default router;
