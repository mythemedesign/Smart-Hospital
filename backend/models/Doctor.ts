import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
	name: String,
	specialty: String,
	email: String,
	phone: String,
	avatarUrl: String,
	availableSlots: [String],
	createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Doctor", doctorSchema);
