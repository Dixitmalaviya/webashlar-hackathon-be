import { Router } from 'express';
import {
  createReport,
  getReportById,
  getReports,
  updateReport,
  deleteReport,
  markAsReviewed,
  markAsCritical,
  getReportsByPatient,
  getReportsByDoctor,
  getReportsByHospital,
  getCriticalReports,
  getReportStats,
  searchReports,
  getMyReports,
  getMyReportStats,
  getReportTypes,
  getReportStatuses,
  getAccessLevels,
  uploadReportFile,
  downloadReportFile
} from '../controllers/report.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const r = Router();

// All routes require authentication
r.use(authenticateToken);

// Public endpoints (for authenticated users)
r.get('/types', getReportTypes);
r.get('/statuses', getReportStatuses);
r.get('/access-levels', getAccessLevels);

// My reports endpoints (role-based access)
r.get('/my-reports', getMyReports);
r.get('/my-stats', getMyReportStats);

// Search reports
r.get('/search', searchReports);

// CRUD operations
r.post('/', requireRole(['doctor', 'admin']), createReport);
r.get('/:reportId', getReportById);
r.put('/:reportId', requireRole(['doctor', 'admin']), updateReport);
r.delete('/:reportId', requireRole(['admin']), deleteReport);

// Report actions
r.put('/:reportId/review', requireRole(['doctor']), markAsReviewed);
r.put('/:reportId/critical', requireRole(['doctor']), markAsCritical);

// File operations
r.post('/:reportId/upload', requireRole(['doctor', 'admin']), uploadReportFile);
r.get('/:reportId/download', downloadReportFile);

// Get all reports (with filtering)
r.get('/', getReports);

// Get reports by entity
r.get('/patient/:patientId', getReportsByPatient);
r.get('/doctor/:doctorId', getReportsByDoctor);
r.get('/hospital/:hospitalId', getReportsByHospital);

// Special endpoints
r.get('/critical/all', getCriticalReports);
r.get('/stats/all', getReportStats);

export default r;
