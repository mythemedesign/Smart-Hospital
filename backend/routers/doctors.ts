import express, { Request, Response, Router } from "express";
import Doctor from "../models/Doctor";

const router: Router = express.Router();

// Get all doctors
router.get("/", async (req: Request, res: Response) => {
	try {
		const doctors = await Doctor.find();
		res.json(doctors);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch doctors" });
	}
});

// Create a doctor
router.post("/", async (req: Request, res: Response) => {
	try {
		// Validate request body codes here

		const doctor = new Doctor(req.body);
		await doctor.save();
		res.status(201).json(doctor);
	} catch (err) {
		res.status(400).json({ error: "Failed to create doctor" });
	}
});
// find a Doctor by ID
router.get("/:id", async (req: Request, res: Response) => {
	try {
		const doctor = await Doctor.findById(req.params.id);
		if (!doctor) {
			res.status(404).json({ error: "Doctor not found" });
		}
		res.json(doctor);
	} catch (err) {
		res.status(500).json({ error: "Failed to fetch doctor" });
	}
});

// Update a doctor
router.put("/:id", async (req: Request, res: Response) => {
	try {
		const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!doctor) {
			res.status(404).json({ error: "Doctor not found" });
		}
		res.json(doctor);
	} catch (err) {
		res.status(400).json({ error: "Failed to update doctor" });
	}
});

// Delete a doctor
router.delete("/:id", async (req: Request, res: Response) => {
	try {
		const doctor = await Doctor.findByIdAndDelete(req.params.id);
		if (!doctor) {
			res.status(404).json({ error: "Doctor not found" });
		}
		res.json({ message: "Doctor deleted successfully" });
	} catch (err) {
		res.status(500).json({ error: "Failed to delete doctor" });
	}
});

// Search for doctors by name
router.get("/search", async (req: Request, res: Response) => {
	try {
		const doctors = await Doctor.find({
			name: { $regex: req.query.name, $options: "i" },
		});
		res.json(doctors);
	} catch (err) {
		res.status(500).json({ error: "Failed to search doctors" });
	}
});

export default router;
