import { ConsentService } from '../services/consent.service.js';
import { config } from '../config/mode.js';

export const grantConsent = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await ConsentService.grantConsent(payload, req);
    res.json({ 
      ok: true, 
      consent: result.consent, 
      txHash: result.txHash,
      blockchainEnabled: config.features.consent.blockchain
    });
  } catch (err) { next(err); }
};

export const revokeConsent = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await ConsentService.revokeConsent(payload, req);
    res.json({ 
      ok: true, 
      revoked: result.revoked, 
      txHash: result.txHash,
      blockchainEnabled: config.features.consent.blockchain
    });
  } catch (err) { next(err); }
};

export const checkConsent = async (req, res, next) => {
  try {
    const { patientAddress, requesterAddress, scope } = req.query;
    const allowed = await ConsentService.checkConsent(patientAddress, requesterAddress, scope);
    res.json({ 
      ok: true, 
      allowed,
      blockchainEnabled: config.features.consent.blockchain
    });
  } catch (err) { next(err); }
};

export const getConsentStatus = async (req, res, next) => {
  try {
    const { patientAddress, requesterAddress, scope } = req.query;
    const status = await ConsentService.getConsentStatus(patientAddress, requesterAddress, scope);
    res.json({ ok: true, ...status });
  } catch (err) { next(err); }
};

export const getAllConsents = async (req, res, next) => {
  try {
    const { patientAddress } = req.params;
    const consents = await ConsentService.getAllConsents(patientAddress);
    res.json({ ok: true, consents });
  } catch (err) { next(err); }
};
