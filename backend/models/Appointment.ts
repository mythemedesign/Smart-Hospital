import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
	doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
	patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
	time: String,
	date: Date,
	status: { type: String, default: "scheduled" },
	notes: String,
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Appointment", appointmentSchema);
