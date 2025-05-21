import mongoose, { Schema, Document, Types } from "mongoose";
import { AppointmentInput } from "../validations/appointment";

// Define the interface for Appointment document
export interface IAppointment extends Document {
	doctorId: Types.ObjectId;
	patientId: Types.ObjectId;
	time: string;
	date: Date;
	status: 'scheduled' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
	datetime?: Date; // Virtual property
}

// Valid appointment statuses
const validStatuses = [
	'scheduled',
	'completed',
	'cancelled',
	'no-show',
	'rescheduled'
] as const;

const appointmentSchema = new Schema<IAppointment>(
	{
		doctorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Doctor",
			required: [true, 'Doctor ID is required'],
			validate: {
				validator: async function(value: Types.ObjectId) {
					const Doctor = mongoose.model('Doctor');
					const doctor = await Doctor.findById(value);
					return doctor !== null;
				},
				message: 'Doctor does not exist'
			}
		},
		patientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Patient",
			required: [true, 'Patient ID is required'],
			validate: {
				validator: async function(value: Types.ObjectId) {
					const Patient = mongoose.model('Patient');
					const patient = await Patient.findById(value);
					return patient !== null;
				},
				message: 'Patient does not exist'
			}
		},
		time: {
			type: String,
			required: [true, 'Appointment time is required'],
			validate: {
				validator: function(value: string) {
					// Validate time format (HH:MM)
					if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
						return false;
					}
					// Validate time values
					const [hours, minutes] = value.split(':').map(Number);
					return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
				},
				message: 'Time must be in HH:MM format (24-hour) and valid time values'
			}
		},
		date: {
			type: Date,
			required: [true, 'Appointment date is required'],
			validate: {
				validator: function(value: Date) {
					// Ensure date is not in the past
					const today = new Date();
					today.setHours(0, 0, 0, 0);
					return value >= today;
				},
				message: 'Appointment date cannot be in the past'
			}
		},
		status: {
			type: String,
			enum: {
				values: validStatuses,
				message: 'Please select a valid appointment status'
			},
			default: 'scheduled'
		},
		notes: {
			type: String,
			maxlength: [500, 'Notes cannot exceed 500 characters'],
			trim: true
		}
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Create indexes
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ status: 1 });

// Virtual for appointment datetime
appointmentSchema.virtual('datetime').get(function(this: IAppointment) {
	if (!this.date || !this.time) return null;
	const [hours, minutes] = this.time.split(':').map(Number);
	const datetime = new Date(this.date);
	datetime.setHours(hours, minutes, 0, 0);
	return datetime;
});

// Pre-save middleware to check for scheduling conflicts
appointmentSchema.pre('save', async function(this: IAppointment, next) {
	if (this.isModified('doctorId') || this.isModified('date') || this.isModified('time')) {
		const Appointment = mongoose.model<IAppointment>('Appointment');
		const existingAppointment = await Appointment.findOne({
			doctorId: this.doctorId,
			date: this.date,
			time: this.time,
			_id: { $ne: this._id }
		});

		if (existingAppointment) {
			throw new Error('Doctor already has an appointment scheduled at this time');
		}
	}
	next();
});

export default mongoose.model<IAppointment>("Appointment", appointmentSchema);
