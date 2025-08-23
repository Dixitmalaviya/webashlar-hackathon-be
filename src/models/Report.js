import mongoose from 'mongoose';
import { sha256OfObject } from '../utils/hash.js';


const reportSchema = new mongoose.Schema({
  // Basic report information
  reportType: {
    type: String,
    // required: true,
    enum: [
      'blood_test',
      'urine_test',
      'x_ray',
      'mri_scan',
      'ct_scan',
      'ecg',
      'ultrasound',
      'biopsy',
      'pathology',
      'radiology',
      'cardiology',
      'neurology',
      'pulmonology',
      'endocrinology',
      'general_lab',
      'other'
    ]
  },

  // Report title and description
  title: {
    type: String,
    // required: true,
    trim: true
  },

  description: {
    type: String,
    default: ''
  },

  // Associated entities
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    // required: true
  },

  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    // required: true
  },

  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    // required: true
  },

  // Link to medical record (optional)
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalRecord',
    default: null
  },

  // Report data and files
  reportData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  reportFileUrl: {
    type: String,
    default: null
  },

  reportFileName: {
    type: String,
    default: null
  },

  reportName: {
    type: String,
    default: null
  },

  // Report status and dates
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'reviewed', 'archived'],
    default: 'pending'
  },

  testDate: {
    type: Date,
    // required: true
  },

  reportDate: {
    type: Date,
    default: Date.now
  },

  reviewedDate: {
    type: Date,
    default: null
  },

  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    default: null
  },

  // Report results and findings
  results: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  findings: {
    type: String,
    default: ''
  },

  recommendations: {
    type: String,
    default: ''
  },

  // Critical values and alerts
  isCritical: {
    type: Boolean,
    default: false
  },

  criticalValues: [{
    parameter: String,
    value: String,
    normalRange: String,
    unit: String
  }],

  // Privacy and access control
  isPublic: {
    type: Boolean,
    default: false
  },

  accessLevel: {
    type: String,
    enum: ['private', 'patient', 'doctor', 'hospital', 'public'],
    default: 'private'
  },

  // // Blockchain integration
  // blockchainHash: {
  //   type: String,
  //   default: null
  // },

  // blockchainTxHash: {
  //   type: String,
  //   default: null
  // },

  // Metadata
  tags: [{
    type: String,
    trim: true
  }],

  notes: {
    type: String,
    default: ''
  },

  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reportSchema.index({ patient: 1, reportDate: -1 });
reportSchema.index({ doctor: 1, reportDate: -1 });
reportSchema.index({ hospital: 1, reportDate: -1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ isCritical: 1 });
reportSchema.index({ testDate: 1 });

// Virtual for age calculation
reportSchema.virtual('age').get(function () {
  if (this.testDate) {
    return Math.floor((Date.now() - this.testDate) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Pre-save middleware to update blockchain hash
reportSchema.pre('save', function (next) {
  if (this.isModified('reportData') || this.isModified('results')) {
    // Generate hash for blockchain storage
    const dataToHash = {
      reportType: this.reportType,
      patient: this.patient,
      doctor: this.doctor,
      hospital: this.hospital,
      testDate: this.testDate,
      reportData: this.reportData,
      results: this.results,
      findings: this.findings
    };

    // Import hash utility
    this.blockchainHash = sha256OfObject(dataToHash);
  }
  next();
});

// Instance methods
reportSchema.methods.markAsReviewed = function (reviewerId, reviewNotes = '') {
  this.status = 'reviewed';
  this.reviewedDate = new Date();
  this.reviewedBy = reviewerId;
  if (reviewNotes) {
    this.notes = reviewNotes;
  }
  return this.save();
};

reportSchema.methods.markAsCritical = function (criticalValues) {
  this.isCritical = true;
  this.criticalValues = criticalValues;
  return this.save();
};

// Static methods
reportSchema.statics.findByPatient = function (patientId, options = {}) {
  const query = { patient: patientId };

  if (options.status) {
    query.status = options.status;
  }

  if (options.reportType) {
    query.reportType = options.reportType;
  }

  if (options.isCritical !== undefined) {
    query.isCritical = options.isCritical;
  }

  return this.find(query)
    .populate('doctor', 'fullName specialization')
    .populate('hospital', 'name')
    .populate('reviewedBy', 'fullName')
    .sort({ reportDate: -1 });
};

reportSchema.statics.findByDoctor = function (doctorId, options = {}) {
  const query = { doctor: doctorId };

  if (options.status) {
    query.status = options.status;
  }

  if (options.reportType) {
    query.reportType = options.reportType;
  }

  return this.find(query)
    .populate('patient', 'fullName dob')
    .populate('hospital', 'name')
    .sort({ reportDate: -1 });
};

reportSchema.statics.findCriticalReports = function (hospitalId = null) {
  const query = { isCritical: true };

  if (hospitalId) {
    query.hospital = hospitalId;
  }

  return this.find(query)
    .populate('patient', 'fullName phone email')
    .populate('doctor', 'fullName phone')
    .populate('hospital', 'name')
    .sort({ reportDate: -1 });
};

const Report = mongoose.model('Report', reportSchema);
export default Report;