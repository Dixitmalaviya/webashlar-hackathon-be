import { Router } from "express";
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
  downloadReportFile,
} from "../controllers/report.controller.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

const r = Router();

// // multer setup (store uploaded file temporarily)
// const upload = multer({ dest: "/tmp/uploads/" }); // you can configure a temp directory

// Determine multer storage
let upload;
try {
  const tempDir = "/tmp/uploads";
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  upload = multer({ dest: tempDir });
  console.log("📁 Using disk storage at /tmp/uploads");
} catch (err) {
  console.warn("⚠️ Failed to use disk storage, falling back to memory:", err.message);
  upload = multer({ storage: multer.memoryStorage() });
}


// All routes require authentication
// r.use(authenticateToken);

// Public endpoints (for authenticated users)
r.get("/types", getReportTypes);
r.get("/statuses", getReportStatuses);
r.get("/access-levels", getAccessLevels);

// My reports endpoints (role-based access)
r.get("/my-reports", getMyReports);
r.get("/my-stats", getMyReportStats);

// Search reports
r.get("/search", searchReports);

// CRUD operations
r.post("/", requireRole(["doctor", "admin"]), createReport);
r.get("/:reportId", getReportById);
r.put("/:reportId", updateReport);
r.delete("/:reportId", authenticateToken, deleteReport);

// Report actions
r.put("/:reportId/review", requireRole(["doctor"]), markAsReviewed);
r.put("/:reportId/critical", requireRole(["doctor"]), markAsCritical);

// File operations
r.post("/upload", upload.single("file"), uploadReportFile);
r.get("/:reportId/download", downloadReportFile);

// Get all reports (with filtering)
r.get("/", authenticateToken, getReports);

// Get reports by entity
r.get("/patient/:patientId", authenticateToken, getReportsByPatient);
r.get("/doctor/:doctorId", getReportsByDoctor);
r.get("/hospital/:hospitalId", getReportsByHospital);

// Special endpoints
r.get("/critical/all", getCriticalReports);
r.get("/stats/all", getReportStats);

export default r;
