import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  fullName: { type: String, required: true, maxlength: 150 },
  dob: { type: Date, required: true },
  gender: { type: String, maxlength: 20, default: "Male" },
  bloodGroup: { type: String, maxlength: 5, default: "A" },
  contactNumber: { type: String, maxlength: 20 },
  email: { type: String, maxlength: 100, unique: true },
  address: { type: String },
  emergencyContact: { name: String, relationship: String, phone: String },
  walletAddress: { type: String },
  blockchainHash: { type: String },
  cardNumber: { type: String, maxlength: 20 },
  // sbtTokenId: { type: Number, unique: true }
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
