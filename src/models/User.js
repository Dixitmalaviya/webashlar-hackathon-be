import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'hospital', 'admin'],
    // required: true,
    default: 'patient'
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityModel',
    // required: true
  },
  entityModel: {
    type: String,
    enum: ['Patient', 'Doctor', 'Hospital'],
    // required: true,
    default: 'Patient'
  },
  walletAddress: {
    type: String,
    // required: true,
    // unique: true
  },
  transactions: [{
    hash: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    description: {
      type: String,
      default: ''
    }
  }],

  blockchainHash: { type: String },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  twoFactorSecret: String,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
// userSchema.index({ email: 1 });
// userSchema.index({ walletAddress: 1 });
// userSchema.index({ role: 1, entityId: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add a blockchain transaction to the user's history
userSchema.methods.addTransaction = async function (hash, description = '') {
  this.transactions.push({
    hash,
    description,
    timestamp: new Date()
  });
  return await this.save();
};



// Check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Virtual for checking if account is locked
userSchema.virtual('locked').get(function () {
  return this.isLocked();
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    delete ret.twoFactorSecret;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

export default User;
