import { Router } from 'express';
import {
  createRelationship,
  getPatientDoctors,
  getDoctorPatients,
  getDoctorPatientData,
  getPatientDoctorData,
  getRelationshipRecords,
  getRelationshipReports,
  endRelationship,
  updateRelationshipNotes,
  getRelationshipStats,
  getMyDoctors,
  getMyPatients,
  getMyPatientData,
  getMyDoctorData,
  getHospitalRelationships,
  getHospitalStats
} from '../controllers/relationship.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const r = Router();

// All routes require authentication
r.use(authenticateToken);

// Create relationship (admin or hospital can create)
// r.post('/', requireRole(['admin', 'hospital']), createRelationship);
r.post('/', createRelationship);

// Get relationship statistics for current user
r.get('/stats', getRelationshipStats);

// Hospital-specific endpoints (only for hospitals)
r.get('/hospital/relationships', requireRole('hospital'), getHospitalRelationships);
r.get('/hospital/stats', requireRole('hospital'), getHospitalStats);

// Patient-specific endpoints (only for patients)
// r.get('/my-doctors', requireRole('patient'), getMyDoctors);
r.get('/my-doctors', getMyDoctors);
// r.get('/my-doctor/:doctorId', requireRole('patient'), getMyDoctorData);
r.get('/my-doctor/:doctorId', getMyDoctorData);

// Doctor-specific endpoints (only for doctors)
// r.get('/my-patients', requireRole('doctor'), getMyPatients);
r.get('/my-patients', getMyPatients);
// r.get('/my-patient/:patientId', requireRole('doctor'), getMyPatientData);
r.get('/my-patient/:patientId', getMyPatientData);

// General relationship endpoints (admin access)
r.get('/patient/:patientId/doctors', requireRole('admin'), getPatientDoctors);
r.get('/doctor/:doctorId/patients', requireRole('admin'), getDoctorPatients);
r.get('/doctor/:doctorId/patient/:patientId', requireRole('admin'), getDoctorPatientData);
r.get('/patient/:patientId/doctor/:doctorId', requireRole('admin'), getPatientDoctorData);
r.get('/patient/:patientId/doctor/:doctorId/records', requireRole('admin'), getRelationshipRecords);
r.get('/patient/:patientId/doctor/:doctorId/reports', requireRole('admin'), getRelationshipReports);

// Relationship management (admin or involved parties)
r.put('/:relationshipId/end', requireRole(['admin', 'patient', 'doctor']), endRelationship);
r.put('/:relationshipId/notes', requireRole(['admin', 'patient', 'doctor']), updateRelationshipNotes);

export default r;
