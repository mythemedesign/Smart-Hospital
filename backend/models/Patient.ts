import mongoose, { Schema, Document } from "mongoose";

// Custom validators
const phoneNumberValidator = {
	validator: function(v: string) {
		// Allows formats: (123) 456-7890, 123-456-7890, 1234567890, +1 123-456-7890
		return /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(v);
	},
	message: (props: { value: string }) => `${props.value} is not a valid phone number!`
};

const bloodTypeValidator = {
	validator: function(v: string) {
		return /^(A|B|AB|O)[+-]$/.test(v);
	},
	message: (props: { value: string }) => `${props.value} is not a valid blood type! Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-`
};

export interface IPatient extends Document {
	// Basic Information
	name: string;
	birthdate: Date;
	gender: "male" | "female" | "other";
	status: "admitted" | "discharged" | "outpatient";
	
	// Contact Information
	email: string;
	phone: string;
	address?: string;
	emergencyName?: string;
	emergencyPhone?: string;
	
	// Medical Information
	bloodType?: string;
	allergies?: string[];
	medicalHistory?: string[];
	treatments?: string[];
	medicalNotes?: string;
}

const PatientSchema = new Schema<IPatient>(
	{
		// Basic Information
		name: { 
			type: String, 
			required: [true, 'Name is required'],
			trim: true,
			minlength: [2, 'Name must be at least 2 characters long'],
			maxlength: [100, 'Name cannot exceed 100 characters'],
			validate: {
				validator: function(v: string) {
					return /^[a-zA-Z\s\-']+$/.test(v);
				},
				message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
			}
		},
		birthdate: { 
			type: Date,
			required: [true, 'Birthdate is required'],
			validate: {
				validator: function(value: Date) {
					// Ensure date is not in the future
					const today = new Date();
					return value <= today;
				},
				message: 'Birthdate cannot be in the future'
			}
		},
		gender: { 
			type: String, 
			enum: {
				values: ["male", "female", "other"],
				message: '{VALUE} is not a valid gender. Must be one of: male, female, other'
			},
			required: [true, 'Gender is required']
		},
		status: {
			type: String,
			enum: {
				values: ["admitted", "discharged", "outpatient"],
				message: '{VALUE} is not a valid status. Must be one of: admitted, discharged, outpatient'
			},
			default: "outpatient"
		},

		// Contact Information
		email: { 
			type: String, 
			trim: true,
			lowercase: true,
			unique: true,
			match: [
				/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
				'Please enter a valid email address'
			],
			maxlength: [100, 'Email cannot exceed 100 characters']
		},
		phone: { 
			type: String, 
			required: [true, 'Phone number is required'],
			trim: true,
			validate: [phoneNumberValidator],
			maxlength: [20, 'Phone number cannot exceed 20 characters']
		},
		address: { 
			type: String,
			trim: true,
			maxlength: [200, 'Address cannot exceed 200 characters'],
			validate: {
				validator: function(v: string) {
					if (!v) return true; // Optional field
					return v.length >= 5;
				},
				message: 'Address must be at least 5 characters long if provided'
			}
		},
		emergencyName: { 
			type: String,
			trim: true,
			maxlength: [100, 'Emergency contact name cannot exceed 100 characters'],
			validate: {
				validator: function(v: string) {
					if (!v) return true; // Optional field
					return /^[a-zA-Z\s\-']+$/.test(v);
				},
				message: 'Emergency contact name can only contain letters, spaces, hyphens, and apostrophes'
			}
		},
		emergencyPhone: { 
			type: String,
			trim: true,
			validate: [phoneNumberValidator],
			maxlength: [20, 'Emergency phone number cannot exceed 20 characters']
		},

		// Medical Information
		bloodType: { 
			type: String,
			trim: true,
			uppercase: true,
			validate: [bloodTypeValidator]
		},
		allergies: [{ 
			type: String,
			trim: true,
			maxlength: [100, 'Allergy description cannot exceed 100 characters'],
			validate: {
				validator: function(v: string) {
					return v.length >= 2;
				},
				message: 'Allergy description must be at least 2 characters long'
			}
		}],
		medicalHistory: [{ 
			type: String,
			trim: true,
			maxlength: [200, 'Medical history entry cannot exceed 200 characters'],
			validate: {
				validator: function(v: string) {
					return v.length >= 3;
				},
				message: 'Medical history entry must be at least 3 characters long'
			}
		}],
		treatments: [{ 
			type: String,
			trim: true,
			maxlength: [200, 'Treatment description cannot exceed 200 characters'],
			validate: {
				validator: function(v: string) {
					return v.length >= 3;
				},
				message: 'Treatment description must be at least 3 characters long'
			}
		}],
		medicalNotes: { 
			type: String,
			trim: true,
			maxlength: [1000, 'Medical notes cannot exceed 1000 characters']
		}
	},
	{
		timestamps: true,
		versionKey: false,
		strict: true,
		validateBeforeSave: true
	}
);

// Add compound index for name and email for faster searches
PatientSchema.index({ name: 1, email: 1 });

// Add text index for searching through medical information
PatientSchema.index({ 
	medicalHistory: 'text', 
	treatments: 'text', 
	medicalNotes: 'text' 
});

// Pre-save middleware to ensure arrays are unique
PatientSchema.pre('save', function(next) {
	if (this.allergies) {
		this.allergies = [...new Set(this.allergies)];
	}
	if (this.medicalHistory) {
		this.medicalHistory = [...new Set(this.medicalHistory)];
	}
	if (this.treatments) {
		this.treatments = [...new Set(this.treatments)];
	}
	next();
});

// Virtual for full name
PatientSchema.virtual('fullName').get(function() {
	return `${this.name}`;
});

// Method to check if patient is active
PatientSchema.methods.isActive = function() {
	return this.status === 'admitted' || this.status === 'outpatient';
};

export default mongoose.models.Patient || mongoose.model<IPatient>("Patient", PatientSchema);
