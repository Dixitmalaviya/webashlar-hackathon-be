import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  fullName: { type: String, required: true, maxlength: 150 },
  specialization: { type: String, maxlength: 100 },
  qualification: { type: String, maxlength: 100 },
  licenseNumber: { type: String, unique: true, maxlength: 50 },
  contactNumber: { type: String, maxlength: 20 },
  email: { type: String, unique: true, maxlength: 100 },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  walletAddress: { type: String },
  blockchainHash: { type: String, unique: true },
  sbtTokenId: { type: Number, unique: true }
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
