import mongoose from 'mongoose';

const relationshipSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  relationshipType: {
    type: String,
    enum: ['primary_care', 'specialist', 'consultant', 'emergency'],
    default: 'primary_care'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: ''
  },
  // For blockchain integration
  blockchainHash: String,
  blockchainTxHash: String,
  blockchainEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
relationshipSchema.index({ patient: 1, doctor: 1 });
relationshipSchema.index({ doctor: 1, patient: 1 });
relationshipSchema.index({ hospital: 1 });
relationshipSchema.index({ isActive: 1 });

// Ensure unique patient-doctor combinations
relationshipSchema.index({ patient: 1, doctor: 1 }, { unique: true });

const Relationship = mongoose.model('Relationship', relationshipSchema);

export default Relationship;
