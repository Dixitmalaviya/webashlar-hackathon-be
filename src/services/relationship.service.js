import Relationship from '../models/Relationship.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Report from '../models/Report.js';
import { sha256OfObject } from '../utils/hash.js';
import { contracts } from '../config/web3.js';
import { config } from '../config/mode.js';

function signerFromHeader(req) {
  const pk = req.headers['x-user-private-key'];
  // Only create signer if blockchain is enabled
  if (config.features.consent.blockchain && pk) {
    return contracts.signerFromPrivateKey(pk);
  }
  return null;
}

export class RelationshipService {
  // Create a new patient-doctor relationship
  static async createRelationship(relationshipData, req) {
    const { patientId, doctorId, hospitalId, relationshipType, notes } = relationshipData;

    // Check if relationship already exists
    const existingRelationship = await Relationship.findOne({
      patient: patientId,
      doctor: doctorId,
      isActive: true
    });

    if (existingRelationship) {
      throw new Error('Relationship already exists between this patient and doctor');
    }

    // Validate entities exist
    const [patient, doctor, hospital] = await Promise.all([
      Patient.findById(patientId),
      Doctor.findById(doctorId),
      Hospital.findById(hospitalId)
    ]);

    if (!patient) throw new Error('Patient not found');
    if (!doctor) throw new Error('Doctor not found');
    if (!hospital) throw new Error('Hospital not found');

    const blockchainHash = sha256OfObject({
      patientId,
      doctorId,
      hospitalId,
      relationshipType,
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
      patient: patientId,
      doctor: doctorId,
      hospital: hospitalId,
      relationshipType: relationshipType || 'primary_care',
      notes: notes || '',
      blockchainHash,
      blockchainTxHash: txHash,
      blockchainEnabled: config.features.consent.blockchain
    });

    return { relationship, txHash };
  }

  // Get all doctors for a patient
  static async getPatientDoctors(patientId, limit = 10, offset = 0) {
    const [relationships, total] = await Promise.all([
      Relationship.find({
        patient: patientId,
        isActive: true
      })
        .skip(offset)
        .limit(limit)
        .populate([
          {
            path: 'doctor',
            select: 'fullName licenseNumber specialization phone email yearsOfExperience'
          },
          {
            path: 'hospital',
            select: 'name address phone type'
          }
        ]),
      Relationship.countDocuments({
        patient: patientId,
        isActive: true
      })
    ]);

    const data = relationships.map(rel => ({
      relationshipId: rel._id,
      relationshipType: rel.relationshipType,
      startDate: rel.startDate,
      notes: rel.notes,
      doctor: rel.doctor,
      hospital: rel.hospital,
      isActive: rel.isActive
    }));

    return { data, total };
  }


  // Get all patients for a doctor
  static async getDoctorPatients(doctorId, limit = 10, offset = 0) {
    const [relationships, total] = await Promise.all([
      Relationship.find({
        doctor: doctorId,
        isActive: true
      })
        .skip(offset)
        .limit(limit)
        .populate([
          {
            path: 'patient',
            select: 'fullName dob phone email address emergencyContact'
          },
          {
            path: 'hospital',
            select: 'name address phone type'
          }
        ]),
      Relationship.countDocuments({
        doctor: doctorId,
        isActive: true
      })
    ]);

    const data = relationships.map(rel => ({
      relationshipId: rel._id,
      relationshipType: rel.relationshipType,
      startDate: rel.startDate,
      notes: rel.notes,
      ...rel.patient._doc,
      hospital: rel.hospital,
      isActive: rel.isActive
    }));

    return { data, total };
  }

  // Get all medical records for a patient-doctor relationship
  static async getRelationshipRecords(patientId, doctorId) {
    const records = await MedicalRecord.find({
      patient: patientId,
      doctor: doctorId
    }).populate([
      {
        path: 'patient',
        select: 'fullName dob'
      },
      {
        path: 'doctor',
        select: 'fullName specialization'
      },
      {
        path: 'hospital',
        select: 'name'
      }
    ]).sort({ createdAt: -1 });

    return records;
  }

  // Get all reports for a patient-doctor relationship
  static async getRelationshipReports(patientId, doctorId) {
    const records = await MedicalRecord.find({
      patient: patientId,
      doctor: doctorId
    }).populate({
      path: 'reports',
      select: 'reportType reportFileUrl reportData createdAt'
    });

    const reports = records.flatMap(record =>
      record.reports.map(report => ({
        recordId: record._id,
        recordDiagnosis: record.diagnosis,
        reportId: report._id,
        reportType: report.reportType,
        reportFileUrl: report.reportFileUrl,
        reportData: report.reportData,
        createdAt: report.createdAt
      }))
    );

    return reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Get comprehensive patient data for a doctor
  static async getDoctorPatientData(doctorId, patientId) {
    const relationship = await Relationship.findOne({
      doctor: doctorId,
      patient: patientId,
      isActive: true
    }).populate([
      {
        path: 'patient',
        select: 'fullName dob phone email address emergencyContact'
      },
      {
        path: 'hospital',
        select: 'name address phone type'
      }
    ]);

    if (!relationship) {
      throw new Error('No active relationship found between doctor and patient');
    }

    // Get all medical records
    const records = await this.getRelationshipRecords(patientId, doctorId);

    // Get all reports
    const reports = await this.getRelationshipReports(patientId, doctorId);

    return {
      relationship: {
        relationshipId: relationship._id,
        relationshipType: relationship.relationshipType,
        startDate: relationship.startDate,
        notes: relationship.notes,
        hospital: relationship.hospital
      },
      patient: relationship.patient,
      medicalRecords: records,
      reports: reports,
      summary: {
        totalRecords: records.length,
        totalReports: reports.length,
        lastVisit: records.length > 0 ? records[0].createdAt : null,
        relationshipDuration: Date.now() - relationship.startDate.getTime()
      }
    };
  }

  // Get comprehensive doctor data for a patient
  static async getPatientDoctorData(patientId, doctorId) {
    const relationship = await Relationship.findOne({
      patient: patientId,
      doctor: doctorId,
      isActive: true
    }).populate([
      {
        path: 'doctor',
        select: 'fullName licenseNumber specialization phone email yearsOfExperience'
      },
      {
        path: 'hospital',
        select: 'name address phone type'
      }
    ]);

    if (!relationship) {
      throw new Error('No active relationship found between patient and doctor');
    }

    // Get all medical records
    const records = await this.getRelationshipRecords(patientId, doctorId);

    // Get all reports
    const reports = await this.getRelationshipReports(patientId, doctorId);

    return {
      relationship: {
        relationshipId: relationship._id,
        relationshipType: relationship.relationshipType,
        startDate: relationship.startDate,
        notes: relationship.notes,
        hospital: relationship.hospital
      },
      doctor: relationship.doctor,
      medicalRecords: records,
      reports: reports,
      summary: {
        totalRecords: records.length,
        totalReports: reports.length,
        lastVisit: records.length > 0 ? records[0].createdAt : null,
        relationshipDuration: Date.now() - relationship.startDate.getTime()
      }
    };
  }

  // End a relationship
  static async endRelationship(relationshipId, req) {
    const relationship = await Relationship.findById(relationshipId);

    if (!relationship) {
      throw new Error('Relationship not found');
    }

    if (!relationship.isActive) {
      throw new Error('Relationship is already inactive');
    }

    let txHash = null;

    // Blockchain update (if enabled)
    if (config.features.consent.blockchain) {
      const signer = signerFromHeader(req);
      if (!signer) {
        throw new Error('Missing x-user-private-key for on-chain relationship update');
      }

      // Note: This would require blockchain integration
      txHash = 'blockchain_update_' + Date.now();
    }

    relationship.isActive = false;
    relationship.endDate = new Date();
    if (txHash) {
      relationship.blockchainTxHash = txHash;
    }

    await relationship.save();

    return { relationship, txHash };
  }

  // Update relationship notes
  static async updateRelationshipNotes(relationshipId, notes, req) {
    const relationship = await Relationship.findById(relationshipId);

    if (!relationship) {
      throw new Error('Relationship not found');
    }

    relationship.notes = notes;
    await relationship.save();

    return { relationship };
  }

  // Get relationship statistics
  static async getRelationshipStats(userId, userRole) {
    let stats = {};

    if (userRole === 'patient') {
      // Get patient's relationship stats
      const relationships = await Relationship.find({
        patient: userId,
        isActive: true
      }).populate('doctor', 'fullName specialization');

      stats = {
        totalDoctors: relationships.length,
        doctors: relationships.map(rel => ({
          doctorId: rel.doctor._id,
          doctorName: rel.doctor.fullName,
          specialization: rel.doctor.specialization,
          relationshipType: rel.relationshipType,
          startDate: rel.startDate
        }))
      };
    } else if (userRole === 'doctor') {
      // Get doctor's relationship stats
      const relationships = await Relationship.find({
        doctor: userId,
        isActive: true
      }).populate('patient', 'fullName dob');

      stats = {
        totalPatients: relationships.length,
        patients: relationships.map(rel => ({
          patientId: rel.patient._id,
          patientName: rel.patient.fullName,
          dob: rel.patient.dob,
          relationshipType: rel.relationshipType,
          startDate: rel.startDate
        }))
      };
    }

    return stats;
  }
}
