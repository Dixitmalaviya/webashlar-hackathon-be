import { RecordService } from '../services/record.service.js';
import { config } from '../config/mode.js';

export const createRecord = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await RecordService.createRecord(payload);
    res.json({ 
      ok: true, 
      record: result.record,
      blockchainEnabled: config.features.records.blockchain
    });
  } catch (err) { next(err); }
};

export const attachReport = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await RecordService.attachReport(payload);
    res.json({ 
      ok: true, 
      report: result.report,
      blockchainEnabled: config.features.records.blockchain
    });
  } catch (err) { next(err); }
};

export const getRecord = async (req, res, next) => {
  try {
    const result = await RecordService.getRecord(req.params.id);
    res.json({ 
      ok: true, 
      record: result.record,
      blockchainEnabled: config.features.records.blockchain
    });
  } catch (err) { next(err); }
};

export const getAllRecords = async (req, res, next) => {
  try {
    const result = await RecordService.getAllRecords();
    res.json({ 
      ok: true, 
      records: result.records,
      blockchainEnabled: config.features.records.blockchain
    });
  } catch (err) { next(err); }
};

export const getRecordsByPatient = async (req, res, next) => {
  try {
    const result = await RecordService.getRecordsByPatient(req.params.patientId);
    res.json({ 
      ok: true, 
      records: result.records,
      blockchainEnabled: config.features.records.blockchain
    });
  } catch (err) { next(err); }
};

export const getRecordsByDoctor = async (req, res, next) => {
  try {
    const result = await RecordService.getRecordsByDoctor(req.params.doctorId);
    res.json({ 
      ok: true, 
      records: result.records,
      blockchainEnabled: config.features.records.blockchain
    });
  } catch (err) { next(err); }
};

export const getRecordsByHospital = async (req, res, next) => {
  try {
    const result = await RecordService.getRecordsByHospital(req.params.hospitalId);
    res.json({ 
      ok: true, 
      records: result.records,
      blockchainEnabled: config.features.records.blockchain
    });
  } catch (err) { next(err); }
};

export const updateRecord = async (req, res, next) => {
  try {
    const result = await RecordService.updateRecord(req.params.id, req.body);
    res.json({ 
      ok: true, 
      record: result.record,
      blockchainEnabled: config.features.records.blockchain
    });
  } catch (err) { next(err); }
};

export const deleteRecord = async (req, res, next) => {
  try {
    const result = await RecordService.deleteRecord(req.params.id);
    res.json({ 
      ok: true, 
      deleted: result.deleted,
      record: result.record,
      blockchainEnabled: config.features.records.blockchain
    });
  } catch (err) { next(err); }
};
