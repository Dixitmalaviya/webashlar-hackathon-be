import { IdentityService } from '../services/identity.service.js';
import { config } from '../config/mode.js';

export const registerPatient = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await IdentityService.registerPatient(payload, req);
    res.json({ 
      ok: true, 
      patient: result.patient, 
      txHash: result.txHash,
      blockchainEnabled: config.features.identity.blockchain
    });
  } catch (err) { next(err); }
};

export const registerDoctor = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await IdentityService.registerDoctor(payload, req);
    res.json({ 
      ok: true, 
      doctor: result.doctor, 
      txHash: result.txHash,
      blockchainEnabled: config.features.identity.blockchain
    });
  } catch (err) { next(err); }
};

export const registerHospital = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await IdentityService.registerHospital(payload, req);
    res.json({ 
      ok: true, 
      hospital: result.hospital, 
      txHash: result.txHash,
      blockchainEnabled: config.features.identity.blockchain
    });
  } catch (err) { next(err); }
};

export const getPatient = async (req, res, next) => {
  try {
    const patient = await IdentityService.getPatientById(req.params.id);
    if (!patient) {
      res.status(404);
      throw new Error('Patient not found');
    }
    res.json({ ok: true, patient });
  } catch (err) { next(err); }
};

export const getDoctor = async (req, res, next) => {
  try {
    const doctor = await IdentityService.getDoctorById(req.params.id);
    if (!doctor) {
      res.status(404);
      throw new Error('Doctor not found');
    }
    res.json({ ok: true, doctor });
  } catch (err) { next(err); }
};

export const getHospital = async (req, res, next) => {
  try {
    const hospital = await IdentityService.getHospitalById(req.params.id);
    if (!hospital) {
      res.status(404);
      throw new Error('Hospital not found');
    }
    res.json({ ok: true, hospital });
  } catch (err) { next(err); }
};

export const getAllPatients = async (req, res, next) => {
  try {
    const patients = await IdentityService.getAllPatients();
    res.json({ ok: true, patients });
  } catch (err) { next(err); }
};

export const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await IdentityService.getAllDoctors();
    res.json({ ok: true, doctors });
  } catch (err) { next(err); }
};

export const getAllHospitals = async (req, res, next) => {
  try {
    const hospitals = await IdentityService.getAllHospitals();
    res.json({ ok: true, hospitals });
  } catch (err) { next(err); }
};
