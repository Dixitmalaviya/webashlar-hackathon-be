import Report from '../models/Report.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Hospital from '../models/Hospital.js';
import MedicalRecord from '../models/MedicalRecord.js';
import { sha256OfObject } from '../utils/hash.js';
import { contracts } from '../config/web3.js';
import { config } from '../config/mode.js';

function signerFromHeader(req) {
  const pk = req.headers['x-user-private-key'];
  // Only create signer if blockchain is enabled
  if (config.features.records.blockchain && pk) {
    return contracts.signerFromPrivateKey(pk);
  }
  return null;
}

export class ReportService {
  // Create a new medical report
  static async createReport(reportData, req) {
    const {
      patientId,
      doctorId,
      hospitalId,
      medicalRecordId,
      reportType,
      title,
      description,
      testDate,
      // reportData,
      results,
      findings,
      recommendations,
      isCritical,
      criticalValues,
      accessLevel,
      tags,
      notes
    } = reportData;

    console.log("Current User", (req.user.id).toString())

    // // Validate required fields
    // if (!patientId || !doctorId || !hospitalId || !reportType || !title || !testDate) {
    //   throw new Error('Patient ID, Doctor ID, Hospital ID, Report Type, Title, and Test Date are required');
    // }

    // Verify entities exist
    const [patient, doctor, hospital] = await Promise.all([
      Patient.findById(patientId),
      Doctor.findById(doctorId),
      Hospital.findById(hospitalId)
    ]);

    if (!patient) throw new Error('Patient not found');
    if (!doctor) throw new Error('Doctor not found');
    if (!hospital) throw new Error('Hospital not found');

    // Verify medical record if provided
    if (medicalRecordId) {
      const medicalRecord = await MedicalRecord.findById(medicalRecordId);
      if (!medicalRecord) throw new Error('Medical record not found');
    }
    // Create report object
    const report = new Report({
      patient: patientId,
      doctor: doctorId,
      hospital: hospitalId,
      medicalRecord: medicalRecordId || null,
      reportType,
      title,
      description: description || '',
      testDate: new Date(testDate),
      reportData: reportData || {},
      results: results || {},
      findings: findings || '',
      recommendations: recommendations || '',
      isCritical: isCritical || false,
      criticalValues: criticalValues || [],
      accessLevel: accessLevel || 'private',
      tags: tags || [],
      notes: notes || '',
      createdBy: (req.user.id).toString() // ✅ This line must be present
    });

    // Save to database
    const savedReport = await report.save();
    console.log("-----------")

    // Blockchain integration (if enabled)
    let txHash = null;
    if (config.features.records.blockchain) {
      try {
        const signer = signerFromHeader(req);
        if (signer) {
          // Store report hash on blockchain
          const reportHash = savedReport.blockchainHash;
          const tx = await contracts.identityRegistry.registerReport(
            patient.walletAddress,
            doctor.walletAddress,
            hospital.walletAddress,
            reportHash,
            { gasLimit: 500000 }
          );
          txHash = tx.hash;

          // Update report with transaction hash
          savedReport.blockchainTxHash = txHash;
          await savedReport.save();
        }
      } catch (error) {
        console.error('Blockchain report registration failed:', error);
        // Continue without blockchain if it fails
      }
    }

    return {
      report: savedReport,
      txHash
    };
  }

  // Get report by ID
  static async getReportById(reportId, req) {
    const report = await Report.findById(reportId)
      .populate('patient', 'fullName dob phone email')
      .populate('doctor', 'fullName specialization phone email')
      .populate('hospital', 'name phone address')
      .populate('medicalRecord', 'diagnosis treatment')
      .populate('reviewedBy', 'fullName specialization')
      .populate('createdBy', 'email')
      .populate('updatedBy', 'email');

    console.log("reportId, reportId", report)
    if (!report) {
      throw new Error('Report not found');
    }

    // Check access permissions
    const userRole = req.user.role;
    const userId = req.user.id;
    const userEntityId = req.user.entityId;

    // Admin can access all reports
    if (userRole === 'admin') {
      return report;
    }

    // // Hospital can access reports from their hospital
    // if (userRole === 'hospital' && report.hospital._id.toString() === userEntityId) {
    //   return report;
    // }

    // // Doctor can access reports they created or are assigned to
    // if (userRole === 'doctor' && 
    //     (report.doctor._id.toString() === userEntityId || report.createdBy._id.toString() === userId)) {
    //   return report;
    // }

    // // Patient can access their own reports
    // if (userRole === 'patient' && report.patient._id.toString() === userEntityId) {
    //   return report;
    // }

    // throw new Error('Access denied');
    return report;
  }

  // Get all reports with filtering
  static async getReports(filters = {}, req) {
    const {
      patientId,
      doctorId,
      hospitalId,
      reportType,
      status,
      isCritical,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'reportDate',
      sortOrder = 'desc'
    } = filters;

    // Build query based on user role and permissions
    const query = {};
    const userRole = req.user.role;
    const userEntityId = req.user.entityId;

    // Apply role-based filtering
    if (userRole === 'patient') {
      query.patient = userEntityId;
    } else if (userRole === 'doctor') {
      query.doctor = userEntityId;
    } else if (userRole === 'hospital') {
      query.hospital = userEntityId;
    }
    // Admin can see all reports

    // Apply additional filters
    if (patientId) query.patient = patientId;
    if (doctorId) query.doctor = doctorId;
    if (hospitalId) query.hospital = hospitalId;
    if (reportType) query.reportType = reportType;
    if (status) query.status = status;
    if (isCritical !== undefined) query.isCritical = isCritical;

    // Date range filtering
    if (startDate || endDate) {
      query.testDate = {};
      if (startDate) query.testDate.$gte = new Date(startDate);
      if (endDate) query.testDate.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Execute query
    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('patient', 'fullName dob')
        .populate('doctor', 'fullName specialization')
        .populate('hospital', 'name')
        .populate('reviewedBy', 'fullName')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Report.countDocuments(query)
    ]);

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update report
  static async updateReport(reportId, updateData, req) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Check permissions
    const userRole = req.user.role;
    const userEntityId = req.user.entityId;

    if (userRole === 'patient' && report.patient.toString() !== userEntityId) {
      throw new Error('Access denied');
    }

    if (userRole === 'doctor' && report.doctor.toString() !== userEntityId) {
      throw new Error('Access denied');
    }

    if (userRole === 'hospital' && report.hospital.toString() !== userEntityId) {
      throw new Error('Access denied');
    }

    // Update fields
    const allowedFields = [
      'title', 'description', 'reportData', 'results', 'findings',
      'recommendations', 'status', 'isCritical', 'criticalValues',
      'accessLevel', 'tags', 'notes', 'reportFileUrl', 'reportFileName'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    updates.updatedBy = req.user.id;

    // Apply updates
    Object.assign(report, updates);
    const updatedReport = await report.save();

    // Blockchain integration (if enabled)
    let txHash = null;
    if (config.features.records.blockchain) {
      try {
        const signer = signerFromHeader(req);
        if (signer) {
          // Update report hash on blockchain
          const reportHash = updatedReport.blockchainHash;
          const tx = await contracts.identityRegistry.updateReport(
            report.patient,
            report.doctor,
            report.hospital,
            reportHash,
            { gasLimit: 500000 }
          );
          txHash = tx.hash;

          updatedReport.blockchainTxHash = txHash;
          await updatedReport.save();
        }
      } catch (error) {
        console.error('Blockchain report update failed:', error);
      }
    }

    return {
      report: updatedReport,
      txHash
    };
  }

  // Delete report
  static async deleteReport(reportId, req) {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Check permissions (only admin and creator can delete)
    const userRole = req.user.role;
    const userId = req.user.id;

    if (userRole !== 'admin' && report.createdBy.toString() !== userId) {
      throw new Error('Access denied');
    }

    // Blockchain integration (if enabled)
    let txHash = null;
    if (config.features.records.blockchain) {
      try {
        const signer = signerFromHeader(req);
        if (signer) {
          // Remove report from blockchain
          const tx = await contracts.identityRegistry.removeReport(
            report.patient,
            report.doctor,
            report.hospital,
            report.blockchainHash,
            { gasLimit: 500000 }
          );
          txHash = tx.hash;
        }
      } catch (error) {
        console.error('Blockchain report deletion failed:', error);
      }
    }

    await Report.findByIdAndDelete(reportId);

    return {
      message: 'Report deleted successfully',
      txHash
    };
  }

  // Mark report as reviewed
  static async markAsReviewed(reportId, reviewData, req) {
    const { reviewNotes } = reviewData;

    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Only doctors can review reports
    if (req.user.role !== 'doctor') {
      throw new Error('Only doctors can review reports');
    }

    await report.markAsReviewed(req.user.entityId, reviewNotes);

    return {
      report,
      message: 'Report marked as reviewed'
    };
  }

  // Mark report as critical
  static async markAsCritical(reportId, criticalData, req) {
    const { criticalValues } = criticalData;

    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // Only doctors can mark reports as critical
    if (req.user.role !== 'doctor') {
      throw new Error('Only doctors can mark reports as critical');
    }

    await report.markAsCritical(criticalValues);

    return {
      report,
      message: 'Report marked as critical'
    };
  }

  // Get reports by patient
  static async getReportsByPatient(patientId, options = {}, req) {
    // Check permissions
    const userRole = req.user.role;
    const userEntityId = req.user.entityId;

    if (userRole === 'patient' && patientId !== userEntityId) {
      throw new Error('Access denied');
    }

    if (userRole === 'doctor') {
      // Check if doctor has relationship with patient
      // This would require relationship service integration
    }

    return await Report.findByPatient(patientId, options);
  }

  // Get reports by doctor
  static async getReportsByDoctor(doctorId, options = {}, req) {
    // Check permissions
    const userRole = req.user.role;
    const userEntityId = req.user.entityId;

    if (userRole === 'doctor' && doctorId !== userEntityId) {
      throw new Error('Access denied');
    }

    return await Report.findByDoctor(doctorId, options);
  }

  // Get critical reports
  static async getCriticalReports(hospitalId = null, req) {
    const userRole = req.user.role;
    const userEntityId = req.user.entityId;

    // Apply hospital filter based on user role
    if (userRole === 'hospital') {
      hospitalId = userEntityId;
    }

    return await Report.findCriticalReports(hospitalId);
  }

  // Get report statistics
  static async getReportStats(filters = {}, req) {
    const userRole = req.user.role;
    const userEntityId = req.user.entityId;

    // Build base query
    const query = {};
    if (userRole === 'patient') {
      query.patient = userEntityId;
    } else if (userRole === 'doctor') {
      query.doctor = userEntityId;
    } else if (userRole === 'hospital') {
      query.hospital = userEntityId;
    }

    // Apply additional filters
    if (filters.startDate || filters.endDate) {
      query.reportDate = {};
      if (filters.startDate) query.reportDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.reportDate.$lte = new Date(filters.endDate);
    }

    const [
      totalReports,
      criticalReports,
      pendingReports,
      completedReports,
      reportsByType
    ] = await Promise.all([
      Report.countDocuments(query),
      Report.countDocuments({ ...query, isCritical: true }),
      Report.countDocuments({ ...query, status: 'pending' }),
      Report.countDocuments({ ...query, status: 'completed' }),
      Report.aggregate([
        { $match: query },
        { $group: { _id: '$reportType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    return {
      totalReports,
      criticalReports,
      pendingReports,
      completedReports,
      reportsByType
    };
  }

  // Search reports
  static async searchReports(searchTerm, filters = {}, req) {
    const userRole = req.user.role;
    const userEntityId = req.user.entityId;

    // Build base query
    const query = {};
    if (userRole === 'patient') {
      query.patient = userEntityId;
    } else if (userRole === 'doctor') {
      query.doctor = userEntityId;
    } else if (userRole === 'hospital') {
      query.hospital = userEntityId;
    }

    // Add search conditions
    const searchQuery = {
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { findings: { $regex: searchTerm, $options: 'i' } },
        { recommendations: { $regex: searchTerm, $options: 'i' } },
        { notes: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    };

    const finalQuery = { ...query, ...searchQuery };

    // Apply additional filters
    if (filters.reportType) finalQuery.reportType = filters.reportType;
    if (filters.status) finalQuery.status = filters.status;
    if (filters.isCritical !== undefined) finalQuery.isCritical = filters.isCritical;

    const reports = await Report.find(finalQuery)
      .populate('patient', 'fullName dob')
      .populate('doctor', 'fullName specialization')
      .populate('hospital', 'name')
      .sort({ reportDate: -1 })
      .limit(filters.limit || 20);

    return reports;
  }
}
