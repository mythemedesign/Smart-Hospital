import mongoose, { Schema,Document } from "mongoose";
import { DoctorInput } from "../validations/doctor";

// Define the interface for Doctor document
export interface IDoctor extends Document, Omit<DoctorInput, 'availableSlots'> {
	availableSlots: Array<{
		day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
		startTime: string;
		endTime: string;
	}>;
	createdAt: Date;
	updatedAt: Date;
}

// List of valid medical specialties
const validSpecialties = [
	'Cardiology',
	'Dermatology',
	'Endocrinology',
	'Gastroenterology',
	'Neurology',
	'Obstetrics and Gynecology',
	'Ophthalmology',
	'Orthopedics',
	'Pediatrics',
	'Psychiatry',
	'Urology',
	'General Medicine',
	'Emergency Medicine',
	'Family Medicine',
	'Internal Medicine',
	'Surgery'
] as const;

const doctorSchema = new Schema<IDoctor>(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			minlength: [2, 'Name must be at least 2 characters long'],
			maxlength: [100, 'Name cannot exceed 100 characters'],
			validate: {
				validator: (value: string) => /^[a-zA-Z\s-']+$/.test(value),
				message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
			}
		},
		specialty: {
			type: String,
			required: [true, 'Specialty is required'],
			enum: {
				values: validSpecialties,
				message: 'Please select a valid medical specialty'
			}
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			trim: true,
			lowercase: true,
			validate: {
				validator: (value: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
				message: 'Invalid email format'
			}
		},
		phone: {
			type: String,
			required: [true, 'Phone number is required'],
			validate: {
				validator: (value: string) => /^\+?[1-9]\d{1,14}$/.test(value),
				message: 'Invalid phone number format'
			}
		},
		avatarUrl: {
			type: String,
			// validate: {
			// 	validator: (value: string) => {
			// 		if (!value) return true; // Allow empty/null values
			// 		return /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value);
			// 	},
			// 	message: 'Invalid URL format'
			// }
		},
		availableSlots: [{
			day: {
				type: String,
				required: [true, 'Day is required'],
				enum: {
					values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
					message: 'Please provide a valid day of the week'
				}
			},
			startTime: {
				type: String,
				required: [true, 'Start time is required'],
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
					message: 'Start time must be in HH:MM format (24-hour) and valid time values'
				}
			},
			endTime: {
				type: String,
				required: [true, 'End time is required'],
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
					message: 'End time must be in HH:MM format (24-hour) and valid time values'
				}
			}
		}],
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

// Create indexes
doctorSchema.index({ email: 1 }, { unique: true });
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ name: 'text' });

// Pre-save middleware to ensure email is lowercase
doctorSchema.pre('save', function(next) {
	if (this.isModified('email')) {
		this.email = this.email.toLowerCase();
	}
	if (this.isModified('availableSlots')) {
		const isValid = this.availableSlots.every(slot => {
			const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
			const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
			const startTotalMinutes = startHours * 60 + startMinutes;
			const endTotalMinutes = endHours * 60 + endMinutes;
			return endTotalMinutes > startTotalMinutes;
		});

		if (!isValid) {
			next(new Error('End time must be after start time for each slot'));
			return;
		}
	}
	next();
});

export default mongoose.model<IDoctor>("Doctor", doctorSchema);
