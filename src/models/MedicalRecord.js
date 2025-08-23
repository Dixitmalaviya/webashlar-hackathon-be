import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', unique: true, sparse: true },
  visitDate: { type: Date, default: Date.now },
  diagnosis: { type: String },
  treatment: { type: String },
  prescription: { type: String },
  notes: { type: String },
  consentScope: { type: String },
  blockchainHash: { type: String, unique: true }
}, { timestamps: true });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
