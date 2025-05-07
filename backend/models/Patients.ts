import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
	name: String,
	age: Number,
	gender: String,
	phone: String,
	email: String,
	medicalHistory: [String],
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Patient", patientSchema);
