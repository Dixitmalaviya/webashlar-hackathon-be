import { IncentiveService } from '../services/incentive.service.js';
import { config } from '../config/mode.js';

export const payout = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await IncentiveService.payout(payload);
    res.json({ 
      ok: true, 
      incentive: result.incentive, 
      txHash: result.txHash,
      blockchainEnabled: config.features.incentives.blockchain
    });
  } catch (err) { next(err); }
};

export const getPayoutHistory = async (req, res, next) => {
  try {
    const { patientAddress } = req.params;
    const result = await IncentiveService.getPayoutHistory(patientAddress);
    res.json({ 
      ok: true, 
      payouts: result.payouts,
      blockchainEnabled: config.features.incentives.blockchain
    });
  } catch (err) { next(err); }
};

export const getAllPayouts = async (req, res, next) => {
  try {
    const result = await IncentiveService.getAllPayouts();
    res.json({ 
      ok: true, 
      payouts: result.payouts,
      blockchainEnabled: config.features.incentives.blockchain
    });
  } catch (err) { next(err); }
};

export const getPayoutStatus = async (req, res, next) => {
  try {
    const { patientAddress, ruleId } = req.query;
    const status = await IncentiveService.getPayoutStatus(patientAddress, ruleId);
    res.json({ ok: true, ...status });
  } catch (err) { next(err); }
};

export const simulatePayout = async (req, res, next) => {
  try {
    const payload = req.body;
    const result = await IncentiveService.simulatePayout(payload);
    res.json({ 
      ok: true, 
      simulation: result.simulation,
      blockchainEnabled: config.features.incentives.blockchain
    });
  } catch (err) { next(err); }
};
