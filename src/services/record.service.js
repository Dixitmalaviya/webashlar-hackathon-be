import MedicalRecord from "../models/MedicalRecord.js";
import Report from "../models/Report.js";
import { sha256OfObject } from "../utils/hash.js";
import { config } from "../config/mode.js";

export class RecordService {
  static async createRecord(payload) {
    const {
      patient,
      doctor,
      hospital,
      diagnosis,
      treatment,
      prescription,
      notes,
      consentScope,
    } = payload;
    const draft = {
      patient,
      doctor,
      hospital,
      diagnosis,
      treatment,
      prescription,
      notes,
      consentScope,
      visitDate: new Date(),
    };

    const blockchainHash = sha256OfObject(draft);

    const record = await MedicalRecord.create({
      ...draft,
      blockchainHash,
      blockchainEnabled: config.features.records.blockchain,
    });

    return { record };
  }

  static async attachReport(payload) {
    const { recordId, reportType, reportFileUrl, reportData } = payload;
    const record = await MedicalRecord.findById(recordId);

    if (!record) {
      throw new Error("Record not found");
    }

    const reportDraft = {
      medicalRecord: record._id,
      reportType,
      reportFileUrl,
      reportData,
      issuedDate: new Date(),
    };

    const blockchainHash = sha256OfObject(reportDraft);
    const report = await Report.create({
      ...reportDraft,
      blockchainHash,
      blockchainEnabled: config.features.records.blockchain,
    });

    record.report = report._id;
    await record.save();

    return { report };
  }

  static async getRecord(id) {
    const record = await MedicalRecord.findById(id).populate(
      "patient doctor hospital report"
    );

    if (!record) {
      throw new Error("Record not found");
    }

    return { record };
  }

  // static async getAllRecords() {
  //   const records = await MedicalRecord.find({}).populate('patient doctor hospital report');
  //   return { records };
  // }

  // static async getRecordsByPatient(patientId) {
  //   const records = await MedicalRecord.find({ patient: patientId }).populate('patient doctor hospital report');
  //   return { records };
  // }

  // static async getRecordsByDoctor(doctorId) {
  //   const records = await MedicalRecord.find({ doctor: doctorId }).populate('patient doctor hospital report');
  //   return { records };
  // }

  // static async getRecordsByHospital(hospitalId) {
  //   const records = await MedicalRecord.find({ hospital: hospitalId }).populate('patient doctor hospital report');
  //   return { records };
  // }

  static async getAllRecords({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      MedicalRecord.find({})
        .skip(skip)
        .limit(limit)
        .populate("patient doctor hospital report"),
      MedicalRecord.countDocuments(),
    ]);
    return { data, page, limit, total };
  }

  static async getRecordsByPatient(patientId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      MedicalRecord.find({ patient: patientId })
        .skip(skip)
        .limit(limit)
        .populate("patient doctor hospital report"),
      MedicalRecord.countDocuments({ patient: patientId }),
    ]);
    return { data, page, limit, total };
  }

  static async getRecordsByDoctor(doctorId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      MedicalRecord.find({ doctor: doctorId })
        .skip(skip)
        .limit(limit)
        .populate("patient doctor hospital report"),
      MedicalRecord.countDocuments({ doctor: doctorId }),
    ]);
    return { data, page, limit, total };
  }

  static async getRecordsByHospital(hospitalId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      MedicalRecord.find({ hospital: hospitalId })
        .skip(skip)
        .limit(limit)
        .populate("patient doctor hospital report"),
      MedicalRecord.countDocuments({ hospital: hospitalId }),
    ]);
    return { data, page, limit, total };
  }

  static async updateRecord(id, updates) {
    const record = await MedicalRecord.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).populate("patient doctor hospital report");

    if (!record) {
      throw new Error("Record not found");
    }

    return { record };
  }

  static async deleteRecord(id) {
    const record = await MedicalRecord.findByIdAndDelete(id);

    if (!record) {
      throw new Error("Record not found");
    }

    return { deleted: true, record };
  }
}
