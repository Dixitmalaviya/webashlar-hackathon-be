import { Router } from 'express';
import { config } from '../config/mode.js';

const r = Router();

// Get system status and configuration
r.get('/status', (req, res) => {
  res.json({
    ok: true,
    service: 'healthcare-chain-api',
    blockchain: {
      mode: config.blockchain.mode,
      enabled: config.blockchain.enabled,
      disabled: config.blockchain.disabled,
      hybrid: config.blockchain.hybrid
    },
    features: config.features,
    timestamp: new Date().toISOString()
  });
});

// Get blockchain configuration details
r.get('/blockchain-config', (req, res) => {
  const blockchainConfig = {
    mode: config.blockchain.mode,
    rpcUrl: process.env.RPC_URL ? 'configured' : 'not configured',
    identityRegistry: process.env.IDENTITY_REGISTRY_ADDRESS ? 'configured' : 'not configured',
    consentManager: process.env.CONSENT_MANAGER_ADDRESS ? 'configured' : 'not configured',
    incentiveVault: process.env.INCENTIVE_VAULT_ADDRESS ? 'configured' : 'not configured',
    hospitalSigner: process.env.HOSPITAL_PRIVATE_KEY ? 'configured' : 'not configured'
  };
  
  res.json({
    ok: true,
    blockchainConfig
  });
});

export default r;
