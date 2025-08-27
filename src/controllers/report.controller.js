import { ReportService } from "../services/report.service.js";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import Report from "../models/Report.js";

// Create a new medical report
export const createReport = async (req, res, next) => {
  try {
    const result = await ReportService.createReport(req.body, req);

    res.status(201).json({
      ok: true,
      message: "Medical report created successfully",
      data: result.report,
      txHash: result.txHash,
    });
  } catch (error) {
    next(error);
  }
};

// Get report by ID
export const getReportById = async (req, res, next) => {
  try {
    const { reportId } = req.params;
    console.log("reportId", reportId);

    if (!reportId) {
      return res.status(400).json({
        ok: false,
        message: "Report ID is required",
      });
    }

    const report = await ReportService.getReportById(reportId, req);

    res.json({
      ok: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// Get all reports with filtering
export const getReports = async (req, res, next) => {
  try {
    const filters = {
      patientId: req.query.patientId,
      doctorId: req.query.doctorId,
      hospitalId: req.query.hospitalId,
      reportType: req.query.reportType,
      status: req.query.status,
      isCritical: req.query.isCritical === "true",
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "reportDate",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await ReportService.getReports(filters, req);

    res.json({
      ok: true,
      data: result.reports,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Update report
export const updateReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({
        ok: false,
        message: "Report ID is required",
      });
    }

    const result = await ReportService.updateReport(reportId, req.body, req);

    res.json({
      ok: true,
      message: "Report updated successfully",
      data: result.report,
      txHash: result.txHash,
    });
  } catch (error) {
    next(error);
  }
};

// Delete report
export const deleteReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({
        ok: false,
        message: "Report ID is required",
      });
    }

    const result = await ReportService.deleteReport(reportId, req);

    res.json({
      ok: true,
      message: result.message,
      txHash: result.txHash,
    });
  } catch (error) {
    next(error);
  }
};

// Mark report as reviewed
export const markAsReviewed = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({
        ok: false,
        message: "Report ID is required",
      });
    }

    const result = await ReportService.markAsReviewed(reportId, req.body, req);

    res.json({
      ok: true,
      message: result.message,
      data: result.report,
    });
  } catch (error) {
    next(error);
  }
};

// Mark report as critical
export const markAsCritical = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({
        ok: false,
        message: "Report ID is required",
      });
    }

    const result = await ReportService.markAsCritical(reportId, req.body, req);

    res.json({
      ok: true,
      message: result.message,
      data: result.report,
    });
  } catch (error) {
    next(error);
  }
};

// Get reports by patient
export const getReportsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const options = {
      // status: req.query.status,
      // reportType: req.query.reportType,
      // isCritical: req.query.isCritical === 'true'
    };

    if (!patientId) {
      return res.status(400).json({
        ok: false,
        message: "Patient ID is required",
      });
    }

    const reports = await ReportService.getReportsByPatient(
      patientId,
      options,
      req
    );

    res.json({
      ok: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get reports by doctor
export const getReportsByDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const options = {
      status: req.query.status,
      reportType: req.query.reportType,
    };

    if (!doctorId) {
      return res.status(400).json({
        ok: false,
        message: "Doctor ID is required",
      });
    }

    const reports = await ReportService.getReportsByDoctor(
      doctorId,
      options,
      req
    );

    res.json({
      ok: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get reports by hospital
export const getReportsByHospital = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;
    const filters = {
      hospitalId,
      reportType: req.query.reportType,
      status: req.query.status,
      isCritical: req.query.isCritical === "true",
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
    };

    if (!hospitalId) {
      return res.status(400).json({
        ok: false,
        message: "Hospital ID is required",
      });
    }

    const result = await ReportService.getReports(filters, req);

    res.json({
      ok: true,
      data: result.reports,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get critical reports
export const getCriticalReports = async (req, res, next) => {
  try {
    const { hospitalId } = req.query;

    const reports = await ReportService.getCriticalReports(hospitalId, req);

    res.json({
      ok: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get report statistics
export const getReportStats = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const stats = await ReportService.getReportStats(filters, req);

    res.json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// Search reports
export const searchReports = async (req, res, next) => {
  try {
    const { q: searchTerm } = req.query;
    const filters = {
      reportType: req.query.reportType,
      status: req.query.status,
      isCritical: req.query.isCritical === "true",
      limit: parseInt(req.query.limit) || 20,
    };

    if (!searchTerm) {
      return res.status(400).json({
        ok: false,
        message: "Search term is required",
      });
    }

    const reports = await ReportService.searchReports(searchTerm, filters, req);

    res.json({
      ok: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get my reports (for current user)
export const getMyReports = async (req, res, next) => {
  try {
    const filters = {
      reportType: req.query.reportType,
      status: req.query.status,
      isCritical: req.query.isCritical === "true",
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "reportDate",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await ReportService.getReports(filters, req);

    res.json({
      ok: true,
      data: result.reports,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// Get my report statistics
export const getMyReportStats = async (req, res, next) => {
  try {
    const filters = {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const stats = await ReportService.getReportStats(filters, req);

    res.json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// Get report types
export const getReportTypes = async (req, res, next) => {
  try {
    const reportTypes = [
      "blood_test",
      "urine_test",
      "x_ray",
      "mri_scan",
      "ct_scan",
      "ecg",
      "ultrasound",
      "biopsy",
      "pathology",
      "radiology",
      "cardiology",
      "neurology",
      "pulmonology",
      "endocrinology",
      "general_lab",
      "other",
    ];

    res.json({
      ok: true,
      data: reportTypes,
    });
  } catch (error) {
    next(error);
  }
};

// Get report statuses
export const getReportStatuses = async (req, res, next) => {
  try {
    const statuses = [
      "pending",
      "in_progress",
      "completed",
      "reviewed",
      "archived",
    ];

    res.json({
      ok: true,
      data: statuses,
    });
  } catch (error) {
    next(error);
  }
};

// Get access levels
export const getAccessLevels = async (req, res, next) => {
  try {
    const accessLevels = ["private", "patient", "doctor", "hospital", "public"];

    res.json({
      ok: true,
      data: accessLevels,
    });
  } catch (error) {
    next(error);
  }
};

// Upload report file (placeholder for file upload functionality)
export const uploadReportFile = async (req, res, next) => {
  try {
    const patientId = req.body.patient_id;
    // const patientId = "68a9a1af1b4ef997a1d97fb1";
    const reportName = req.body.reportName;
    const file = req.file;

    if (!file || !patientId || !reportName) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "File or or reportName patient_id missing",
        });
    }

    // Prepare form-data for the 3rd party API
    const form = new FormData();
    // form.append("patient_id", patientId);
    // form.append("files", fs.createReadStream(file.path), file.originalname);

    let fileStream;
    if (file.path) {
      // Disk storage
      fileStream = fs.createReadStream(file.path);
    } else if (file.buffer) {
      // Memory storage
      form.append("files", file.buffer, file.originalname);
    }

    if (!fileStream && !file.buffer) {
      return res.status(400).json({ ok: false, message: "Invalid file upload" });
    }

    form.append("patient_id", patientId);
    if (fileStream) {
      form.append("files", fileStream, file.originalname);
    }

    // Send to external API
    const uploadResponse = await axios.post(
      "https://webashalarforml-health-doc.hf.space/upload_reports",
      form,
      {
        headers: {
          ...form.getHeaders(),
          accept: "*/*",
          origin: "https://webashalarforml-health-doc.hf.space",
          referer: "https://webashalarforml-health-doc.hf.space/",
          "user-agent":
            "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
        },
      }
    );
    console.log("uploadResponse", uploadResponse);
    // Step 2: Extract uploaded file info from response
    const uploadedFileUrl = uploadResponse.data?.patient_folder || null;
    const uploadedFileName = file.originalname;

    // Step 3: Save partial report in DB
    const newReport = await Report.create({
      // reportType,
      // title,
      patient: patientId,
      // doctor,
      // hospital,
      // testDate: new Date(testDate),
      // createdBy,
      reportFileUrl: uploadedFileUrl,
      reportFileName: uploadedFileName,
      reportName: reportName,
    });

    // Clean up local file
    fs.unlink(file.path, (err) => {
      if (err) console.error("Failed to delete local file:", err);
    });

    // Send response back to frontend
    res.json({
      ok: true,
      message: "File uploaded and forwarded successfully",
      data: { ...uploadResponse.data, newReport },
    });
  } catch (error) {
    next(error);
  }
};

// Download report file
export const downloadReportFile = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    if (!reportId) {
      return res.status(400).json({
        ok: false,
        message: "Report ID is required",
      });
    }

    const report = await ReportService.getReportById(reportId, req);

    if (!report.reportFileUrl) {
      return res.status(404).json({
        ok: false,
        message: "No file attached to this report",
      });
    }

    // This would handle file download
    // For now, return file info
    res.json({
      ok: true,
      data: {
        fileUrl: report.reportFileUrl,
        fileName: report.reportFileName,
        message: "File download endpoint - implement file download service",
      },
    });
  } catch (error) {
    next(error);
  }
};
