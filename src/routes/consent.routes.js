import { Router } from 'express';
import { 
  grantConsent, 
  revokeConsent, 
  checkConsent,
  getConsentStatus,
  getAllConsents
} from '../controllers/consent.controller.js';

const r = Router();

// Patient-signed actions
r.post('/grant', grantConsent);
r.post('/revoke', revokeConsent);

// Read-only
r.get('/check', checkConsent);
r.get('/status', getConsentStatus);
r.get('/patient/:patientAddress', getAllConsents);

export default r;
