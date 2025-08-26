import { RelationshipService } from '../services/relationship.service.js';
import Relationship from '../models/Relationship.js';

// Create a new patient-doctor relationship
export const createRelationship = async (req, res, next) => {
  try {
    const { patientId, doctorId, hospitalId, relationshipType, notes } = req.body;

    // Validate required fields
    if (!patientId || !doctorId || !hospitalId) {
      return res.status(400).json({
        ok: false,
        message: 'Patient ID, Doctor ID, and Hospital ID are required'
      });
    }

    const result = await RelationshipService.createRelationship({
      patientId,
      doctorId,
      hospitalId,
      relationshipType,
      notes
    }, req);

    res.status(201).json({
      ok: true,
      message: 'Patient-doctor relationship created successfully',
      data: result.relationship,
      txHash: result.txHash
    });
  } catch (error) {
    next(error);
  }
};

// Get all doctors for a patient
export const getPatientDoctors = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({
        ok: false,
        message: 'Patient ID is required'
      });
    }

    const doctors = await RelationshipService.getPatientDoctors(patientId);

    res.json({
      ok: true,
      data: doctors,
      count: doctors.length
    });
  } catch (error) {
    next(error);
  }
};

// Get all patients for a doctor
export const getDoctorPatients = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    if (!doctorId) {
      return res.status(400).json({
        ok: false,
        message: 'Doctor ID is required'
      });
    }

    const patients = await RelationshipService.getDoctorPatients(doctorId);

    res.json({
      ok: true,
      data: patients,
      count: patients.length
    });
  } catch (error) {
    next(error);
  }
};

// Get comprehensive patient data for a doctor
export const getDoctorPatientData = async (req, res, next) => {
  try {
    const { doctorId, patientId } = req.params;

    if (!doctorId || !patientId) {
      return res.status(400).json({
        ok: false,
        message: 'Doctor ID and Patient ID are required'
      });
    }

    const data = await RelationshipService.getDoctorPatientData(doctorId, patientId);

    res.json({
      ok: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Get comprehensive doctor data for a patient
export const getPatientDoctorData = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.params;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        ok: false,
        message: 'Patient ID and Doctor ID are required'
      });
    }

    const data = await RelationshipService.getPatientDoctorData(patientId, doctorId);

    res.json({
      ok: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Get all medical records for a patient-doctor relationship
export const getRelationshipRecords = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.params;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        ok: false,
        message: 'Patient ID and Doctor ID are required'
      });
    }

    const records = await RelationshipService.getRelationshipRecords(patientId, doctorId);

    res.json({
      ok: true,
      data: records,
      count: records.length
    });
  } catch (error) {
    next(error);
  }
};

// Get all reports for a patient-doctor relationship
export const getRelationshipReports = async (req, res, next) => {
  try {
    const { patientId, doctorId } = req.params;

    if (!patientId || !doctorId) {
      return res.status(400).json({
        ok: false,
        message: 'Patient ID and Doctor ID are required'
      });
    }

    const reports = await RelationshipService.getRelationshipReports(patientId, doctorId);

    res.json({
      ok: true,
      data: reports,
      count: reports.length
    });
  } catch (error) {
    next(error);
  }
};

// End a relationship
export const endRelationship = async (req, res, next) => {
  try {
    const { relationshipId } = req.params;

    if (!relationshipId) {
      return res.status(400).json({
        ok: false,
        message: 'Relationship ID is required'
      });
    }

    const result = await RelationshipService.endRelationship(relationshipId, req);

    res.json({
      ok: true,
      message: 'Relationship ended successfully',
      data: result.relationship,
      txHash: result.txHash
    });
  } catch (error) {
    next(error);
  }
};

// Update relationship notes
export const updateRelationshipNotes = async (req, res, next) => {
  try {
    const { relationshipId } = req.params;
    const { notes } = req.body;

    if (!relationshipId) {
      return res.status(400).json({
        ok: false,
        message: 'Relationship ID is required'
      });
    }

    if (!notes) {
      return res.status(400).json({
        ok: false,
        message: 'Notes are required'
      });
    }

    const result = await RelationshipService.updateRelationshipNotes(relationshipId, notes, req);

    res.json({
      ok: true,
      message: 'Relationship notes updated successfully',
      data: result.relationship
    });
  } catch (error) {
    next(error);
  }
};

// Get relationship statistics for current user
export const getRelationshipStats = async (req, res, next) => {
  try {
    const { userId, role } = req.user;

    if (!userId || !role) {
      return res.status(400).json({
        ok: false,
        message: 'User information is required'
      });
    }

    // For patients, use their entityId, for doctors, use their entityId
    const entityId = req.user.entityId;
    const stats = await RelationshipService.getRelationshipStats(entityId, role);

    res.json({
      ok: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Get my doctors (for patients)
export const getMyDoctors = async (req, res, next) => {
  try {
    const { entityId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { data: doctors, total } = await RelationshipService.getPatientDoctors(entityId, limit, offset);

    res.json({
      ok: true,
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};


// Get my patients (for doctors)
export const getMyPatients = async (req, res, next) => {
  try {
    const { entityId } = req.user;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        ok: false,
        message: 'Only doctors can access this endpoint'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { data: patients, total } = await RelationshipService.getDoctorPatients(entityId, limit, offset);

    res.json({
      ok: true,
      data: patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};


// Get my patient data (for doctors)
export const getMyPatientData = async (req, res, next) => {
  try {
    const { entityId } = req.user;
    const { patientId } = req.params;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        ok: false,
        message: 'Only doctors can access this endpoint'
      });
    }

    if (!patientId) {
      return res.status(400).json({
        ok: false,
        message: 'Patient ID is required'
      });
    }

    const data = await RelationshipService.getDoctorPatientData(entityId, patientId);

    res.json({
      ok: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Get my doctor data (for patients)
export const getMyDoctorData = async (req, res, next) => {
  try {
    const { entityId } = req.user;
    const { doctorId } = req.params;

    if (req.user.role !== 'patient') {
      return res.status(403).json({
        ok: false,
        message: 'Only patients can access this endpoint'
      });
    }

    if (!doctorId) {
      return res.status(400).json({
        ok: false,
        message: 'Doctor ID is required'
      });
    }

    const data = await RelationshipService.getPatientDoctorData(entityId, doctorId);

    res.json({
      ok: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

// Get all relationships for a hospital (for hospital users)
export const getHospitalRelationships = async (req, res, next) => {
  try {
    const { entityId } = req.user;

    if (req.user.role !== 'hospital') {
      return res.status(403).json({
        ok: false,
        message: 'Only hospitals can access this endpoint'
      });
    }

    const relationships = await Relationship.find({
      hospital: entityId,
      isActive: true
    }).populate([
      {
        path: 'patient',
        select: 'fullName dob phone email'
      },
      {
        path: 'doctor',
        select: 'fullName specialization phone email'
      }
    ]);

    res.json({
      ok: true,
      data: relationships,
      count: relationships.length
    });
  } catch (error) {
    next(error);
  }
};

// Get hospital statistics
export const getHospitalStats = async (req, res, next) => {
  try {
    const { entityId } = req.user;

    if (req.user.role !== 'hospital') {
      return res.status(403).json({
        ok: false,
        message: 'Only hospitals can access this endpoint'
      });
    }

    const [totalRelationships, activeRelationships, totalPatients, totalDoctors] = await Promise.all([
      Relationship.countDocuments({ hospital: entityId }),
      Relationship.countDocuments({ hospital: entityId, isActive: true }),
      Relationship.distinct('patient', { hospital: entityId, isActive: true }),
      Relationship.distinct('doctor', { hospital: entityId, isActive: true })
    ]);

    res.json({
      ok: true,
      data: {
        totalRelationships,
        activeRelationships,
        uniquePatients: totalPatients.length,
        uniqueDoctors: totalDoctors.length
      }
    });
  } catch (error) {
    next(error);
  }
};
