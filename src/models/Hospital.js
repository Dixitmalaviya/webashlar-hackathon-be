import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 200 },
  type: { type: String, maxlength: 50 },
  // registrationNumber: { type: String, unique: true, maxlength: 100 },
  registrationNumber: { type: String, maxlength: 100 },
  contactNumber: { type: String, maxlength: 20 },
  email: { type: String, unique: true, maxlength: 100 },
  address: { type: String },
  walletAddress: { type: String },
  blockchainHash: { type: String },
  sbtTokenId: { type: Number }
}, { timestamps: true });

export default mongoose.model('Hospital', hospitalSchema);
