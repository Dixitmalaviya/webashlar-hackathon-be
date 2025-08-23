import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  reminderType: { type: String, maxlength: 50 },
  description: { type: String },
  dueDate: { type: Date },
  status: { type: String, default: 'pending', maxlength: 20 },
  blockchainHash: { type: String, unique: true }
}, { timestamps: true });

export default mongoose.model('Reminder', reminderSchema);
