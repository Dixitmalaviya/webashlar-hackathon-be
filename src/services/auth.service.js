import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
import { config } from '../config/mode.js';
import { sha256OfObject } from '../utils/hash.js';
import mongoose from 'mongoose';
import Relationship from '../models/Relationship.js';


const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export class AuthService {
  // Generate JWT token
  static generateToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      // role: user.role,
      // entityId: user.entityId,
      // walletAddress: user.walletAddress
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Verify JWT token
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Login user
  static async login(email, password) {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // // Check if account is locked
    // if (user.isLocked()) {
    //   throw new Error('Account is temporarily locked due to multiple failed login attempts');
    // }

    // // Check if account is active
    // if (!user.isActive) {
    //   throw new Error('Account is deactivated');
    // }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      throw new Error('Invalid email or password');
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Generate token
    const token = this.generateToken(user);

    // Get entity details
    let entityDetails = null;
    try {
      switch (user.entityModel) {
        case 'Patient':
          entityDetails = await Patient.findById(user.entityId);
          break;
        case 'Doctor':
          entityDetails = await Doctor.findById(user.entityId);
          break;
        case 'Hospital':
          entityDetails = await Hospital.findById(user.entityId);
          break;
      }
    } catch (error) {
      console.error('Error fetching entity details:', error);
    }

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        // walletAddress: user.walletAddress,
        entityId: user.entityId,
        entityDetails
      },
      expiresIn: JWT_EXPIRES_IN
    };
  }

  // Register user
  static async register(userData, entityData, role, blockchainHash, doctor, hospital) {
    const { email, password } = userData;
    console.log("userdarta", userData)
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }]
    });

    console.log("existingUser", existingUser)

    if (existingUser) {
      throw new Error('User with this email or wallet address already exists');
    }

    // Create entity first
    let entity;
    let entityModel;

    switch (role) {
      case 'patient':
        entity = await Patient.create({ ...userData, ...entityData, contactNumber: entityData.phone });
        entityModel = 'Patient';
        break;
      case 'doctor':
        entity = await Doctor.create({ ...userData, ...entityData, contactNumber: entityData.phone, hospital });
        entityModel = 'Doctor';
        break;
      case 'hospital':
        entity = await Hospital.create({ ...userData, ...entityData, contactNumber: entityData.phone });
        entityModel = 'Hospital';
        break;
      default:
        throw new Error('Invalid role');
    }

    // Create user account
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: role,
      entityId: entity._id,
      entityModel,
      // walletAddress,
      blockchainHash,
      transactions: [{
        hash: blockchainHash,
        description: `${entityModel} registered`
      }],
    });

    console.log("user", user)

    if (doctor && hospital) {
      // Validate entities exist
      const [doctorDoc, hospitalDoc] = await Promise.all([
        Doctor.findById(doctor),
        Hospital.findById(hospital)
      ]);

      if (!doctorDoc) throw new Error('Doctor not found');
      if (!hospitalDoc) throw new Error('Hospital not found');

      const blockchainHash = sha256OfObject({
        ...user.entityId,
        doctor,
        hospital,
        relationshipType: 'primary_care',
        timestamp: Date.now()
      });

      let txHash = null;

      // Blockchain registration (if enabled)
      if (config.features.consent.blockchain) {
        const signer = signerFromHeader(req);
        if (!signer) {
          throw new Error('Missing x-user-private-key for on-chain relationship creation');
        }

        // Note: This would require a relationship contract or consent contract
        // For now, we'll just store the hash
        txHash = 'blockchain_hash_' + Date.now();
      }

      const relationship = await Relationship.create({
        patient: user?.entityId,
        doctor: doctorDoc,
        hospital: hospitalDoc,
        relationshipType: 'primary_care',
        notes: '',
        blockchainHash: blockchainHash,
        blockchainTxHash: txHash,
        blockchainEnabled: config.features.consent.blockchain
      });

      console.log("relationship created------->", relationship)
    }
    const userdata = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { createdBy: user._id.toString() },
      { new: true }
    )
    console.log("Updated user:", userdata)

    // Generate token
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        // walletAddress: user.walletAddress,
        entityId: user.entityId,
        entityDetails: entity,
        blockchainHash: blockchainHash,
        transactions: user.transactions,
        createdBy: (userdata._id).toString()
      },
      expiresIn: JWT_EXPIRES_IN
    };
  }

  // Get current user
  static async getCurrentUser(userId) {
    const user = await User.findOne({
      $or: [
        { _id: new mongoose.Types.ObjectId(userId) },
        { entityId: new mongoose.Types.ObjectId(userId) }
      ]
    });
    if (!user) {
      throw new Error('User not found');
    }
    console.log("user--------------------", user)
    // Get entity details
    let entityDetails = null;
    try {
      switch (user.entityModel) {
        case 'Patient':
          entityDetails = await Patient.findById(user.entityId);
          break;
        case 'Doctor':
          entityDetails = await Doctor.findById(user.entityId);
          break;
        case 'Hospital':
          entityDetails = await Hospital.findById(user.entityId);
          break;
      }
    } catch (error) {
      console.error('Error fetching entity details:', error);
    }

    return {
      id: user._id,
      email: user.email,
      role: user.role,
      walletAddress: user.walletAddress,
      entityId: user.entityId,
      entityDetails,
      lastLogin: user.lastLogin,
      isActive: user.isActive
    };
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  // Forgot password
  static async forgotPassword(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry (1 hour)
    const resetPasswordExpires = Date.now() + 60 * 60 * 1000;

    // Save token to user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // In a real application, you would send this token via email
    // For now, we'll return it (remove this in production)
    return {
      message: 'Password reset token generated',
      resetToken, // Remove this in production
      expiresIn: '1 hour'
    };
  }

  // Reset password
  static async resetPassword(token, newPassword) {
    // Hash the token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  // Refresh token
  static async refreshToken(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const token = this.generateToken(user);
    return {
      token,
      expiresIn: JWT_EXPIRES_IN
    };
  }

  // Logout (client-side token removal, but we can track here)
  static async logout(userId) {
    // In a real application, you might want to blacklist the token
    // For now, we'll just update the last login time
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    return { message: 'Logged out successfully' };
  }

  // Get user by wallet address (for blockchain integration)
  static async getUserByWallet(walletAddress) {
    const user = await User.findOne({ walletAddress });
    if (!user) {
      throw new Error('User not found');
    }

    return this.getCurrentUser(user._id);
  }

  // Update user profile with entity update
  static async updateProfile(userId, updateData) {
    // Allowed fields per entity model based on your schema
    const allowedEntityFields = {
      Patient: [
        'fullName', 'dob', 'gender', 'bloodGroup',
        'contactNumber', 'email', 'address',
        'emergencyContact', 'walletAddress'
      ],
      Doctor: [
        'fullName', 'specialization', 'qualification',
        'licenseNumber', 'contactNumber', 'email',
        'hospital', 'walletAddress', 'sbtTokenId'
      ],
      Hospital: [
        'name', 'type', 'registrationNumber',
        'contactNumber', 'email', 'address',
        'walletAddress', 'sbtTokenId'
      ]
    };
    const user = await User.findOne({
      $or: [
        { _id: new mongoose.Types.ObjectId(userId) },
        { entityId: new mongoose.Types.ObjectId(userId) }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    console.log("updateData------", updateData)

    // Allowed user fields to update
    const allowedUserUpdates = ['email'];
    const userUpdates = {};
    let profileChanged = false;
    console.log("==========================================-1")
    // Update user fields
    for (const field of allowedUserUpdates) {
      if (updateData[field] !== undefined && updateData[field] !== user[field]) {
        userUpdates[field] = updateData[field];
        profileChanged = true;
      }
    }
    console.log("==========================================0")
    if (profileChanged) {
      await User.findByIdAndUpdate(userId, userUpdates, { new: true });
    }

    console.log("==========================================1")
    // Allowed entity fields from schema
    const allowedEntityUpdates = allowedEntityFields[user.entityModel] || [];

    // Prepare entity updates from input
    const entityUpdates = {};
    for (const field of allowedEntityUpdates) {
      if (updateData[field] !== undefined) {
        entityUpdates[field] = updateData[field];
      }
    }
    console.log("==========================================2", entityUpdates)
    if (Object.keys(entityUpdates).length > 0) {
      const EntityModel = {
        Patient,
        Doctor,
        Hospital
      }[user.entityModel];

      if (!EntityModel) {
        throw new Error('Invalid entity model');
      }

      await EntityModel.findByIdAndUpdate(user.entityId, entityUpdates, { new: true });
    }

    // Re-fetch updated user
    const updatedUser = await User.findOne({
      $or: [
        { _id: new mongoose.Types.ObjectId(userId) },
        { entityId: new mongoose.Types.ObjectId(userId) }
      ]
    });
    console.log("updated user-------------------------------------------------345", updatedUser)
    // Prepare hash data
    const hashData = {
      email: updatedUser.email,
      walletAddress: updatedUser.walletAddress,
      role: updatedUser.role,
      entityId: updatedUser.entityId.toString(),
    };
    console.log("hashData", hashData)
    // Update blockchain hash if user profile changed
    if (profileChanged) {
      const newHash = sha256OfObject(hashData);
      updatedUser.blockchainHash = newHash;
      await updatedUser.addTransaction(newHash, 'Profile updated');
    }

    // Return updated user + entity details
    return this.getCurrentUser(userId);
  }

  static async deleteProfile(userId) {
    const user = await User.findOne({
      $or: [
        { _id: new mongoose.Types.ObjectId(userId) },
        { entityId: new mongoose.Types.ObjectId(userId) }
      ]
    });
    if (!user) {
      throw new Error('User not found');
    }

    // Delete the associated entity
    const entityModels = { Patient, Doctor, Hospital };
    const EntityModel = entityModels[user.entityModel];

    if (EntityModel && user.entityId) {
      await EntityModel.findByIdAndDelete(user.entityId);
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return {
      id: userId,
      entityDeleted: user.entityId,
      entityModel: user.entityModel
    };
  }
}
