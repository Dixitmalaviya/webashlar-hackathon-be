import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import { sha256OfObject } from "../utils/hash.js";
import { contracts } from "../config/web3.js";
import { config } from "../config/mode.js";

function signerFromHeader(req) {
  const pk = req.headers["x-user-private-key"];
  // Only create signer if blockchain is enabled
  if (config.features.identity.blockchain && pk) {
    return contracts.signerFromPrivateKey(pk);
  }
  return null;
}

export class IdentityService {
  static async registerPatient(payload, req) {
    const blockchainHash = sha256OfObject({ ...payload, role: "Patient" });

    let txHash = null;
    let sbtTokenId = undefined;

    // Blockchain registration (if enabled)
    if (config.features.identity.blockchain) {
      const signer = signerFromHeader(req);
      if (!signer) {
        throw new Error(
          "Missing x-user-private-key for on-chain registration (DEV)."
        );
      }

      const idc = contracts.getIdentityContract(signer);
      const tx = await idc.registerPatient(blockchainHash);
      const rcpt = await tx.wait();
      txHash = rcpt.hash;
    }

    // Database registration
    const patient = await Patient.create({
      ...payload,
      blockchainHash,
      sbtTokenId,
      blockchainTxHash: txHash,
      blockchainEnabled: config.features.identity.blockchain,
    });

    return { patient, txHash };
  }

  static async registerDoctor(payload, req) {
    const blockchainHash = sha256OfObject({
      licenseNumber: payload.licenseNumber,
      email: payload.email,
    });

    let txHash = null;

    // Blockchain registration (if enabled)
    if (config.features.identity.blockchain) {
      const signer = signerFromHeader(req);
      if (!signer) {
        throw new Error("Missing x-user-private-key");
      }

      const idc = contracts.getIdentityContract(signer);
      const tx = await idc.registerDoctor(blockchainHash);
      const rcpt = await tx.wait();
      txHash = rcpt.hash;
    }

    // Database registration
    const doctor = await Doctor.create({
      ...payload,
      blockchainHash,
      blockchainTxHash: txHash,
      blockchainEnabled: config.features.identity.blockchain,
    });

    return { doctor, txHash };
  }

  static async registerHospital(payload, req) {
    const blockchainHash = sha256OfObject({
      regNo: payload.registrationNumber,
      email: payload.email,
    });

    let txHash = null;

    // Blockchain registration (if enabled)
    if (config.features.identity.blockchain) {
      const signer = signerFromHeader(req);
      if (!signer) {
        throw new Error("Missing x-user-private-key");
      }

      const idc = contracts.getIdentityContract(signer);
      const tx = await idc.registerHospital(blockchainHash);
      const rcpt = await tx.wait();
      txHash = rcpt.hash;
    }

    // Database registration
    const hospital = await Hospital.create({
      ...payload,
      blockchainHash,
      blockchainTxHash: txHash,
      blockchainEnabled: config.features.identity.blockchain,
    });

    return { hospital, txHash };
  }

  static async getPatientById(id) {
    return await Patient.findById(id);
  }

  static async getDoctorById(id) {
    return await Doctor.findById(id);
  }

  static async getHospitalById(id) {
    return await Hospital.findById(id);
  }

  // static async getAllPatients() {
  //   return await Patient.find({});
  // }

  // static async getAllDoctors() {
  //   return await Doctor.find({});
  // }

  // static async getAllHospitals() {
  //   return await Hospital.find({});
  // }

  static async getAllPatients({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Patient.find({}).skip(skip).limit(limit),
      Patient.countDocuments(),
    ]);
    return { data, page, limit, total };
  }

  static async getAllDoctors({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Doctor.find({}).skip(skip).limit(limit),
      Doctor.countDocuments(),
    ]);
    return { data, page, limit, total };
  }

  static async getAllHospitals({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Hospital.find({}).skip(skip).limit(limit),
      Hospital.countDocuments(),
    ]);
    return { data, page, limit, total };
  }
}
