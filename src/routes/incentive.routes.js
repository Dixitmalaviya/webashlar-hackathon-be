import { Router } from 'express';
import { 
  payout,
  getPayoutHistory,
  getAllPayouts,
  getPayoutStatus,
  simulatePayout
} from '../controllers/incentive.controller.js';

const r = Router();

// Payout operations
r.post('/payout', payout);
r.post('/simulate', simulatePayout);

// Get endpoints
r.get('/history/:patientAddress', getPayoutHistory);
r.get('/all', getAllPayouts);
r.get('/status', getPayoutStatus);

export default r;
