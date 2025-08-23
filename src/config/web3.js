import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './mode.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read JSON files manually to avoid import assertion issues
const identityAbi = JSON.parse(fs.readFileSync(path.join(__dirname, '../contracts/IdentityRegistry.abi.json'), 'utf8'));
const consentAbi = JSON.parse(fs.readFileSync(path.join(__dirname, '../contracts/ConsentManager.abi.json'), 'utf8'));
const vaultAbi = JSON.parse(fs.readFileSync(path.join(__dirname, '../contracts/IncentiveVault.abi.json'), 'utf8'));

const { RPC_URL, HOSPITAL_PRIVATE_KEY, IDENTITY_REGISTRY_ADDRESS, CONSENT_MANAGER_ADDRESS, INCENTIVE_VAULT_ADDRESS } = process.env;

// Only initialize blockchain components if blockchain is enabled
let provider = null;
let hospitalSigner = null;

if (config.blockchain.enabled || config.blockchain.hybrid) {
  if (!RPC_URL) {
    console.warn('RPC_URL missing - blockchain features will be disabled');
  } else {
    try {
      provider = new ethers.JsonRpcProvider(RPC_URL);
      
      // Server signer used for hospital/admin-only flows in dev (e.g., payout)
      if (HOSPITAL_PRIVATE_KEY) {
        hospitalSigner = new ethers.Wallet(HOSPITAL_PRIVATE_KEY, provider);
      }
    } catch (error) {
      console.warn('Failed to initialize blockchain provider:', error.message);
    }
  }
}

export const contracts = {
  provider,
  getIdentityContract(signer) {
    if (!provider || !IDENTITY_REGISTRY_ADDRESS) {
      throw new Error('Blockchain not configured or disabled');
    }
    const addr = IDENTITY_REGISTRY_ADDRESS;
    const runner = signer || hospitalSigner || provider;
    return new ethers.Contract(addr, identityAbi, runner);
  },
  getConsentContract(signer) {
    if (!provider || !CONSENT_MANAGER_ADDRESS) {
      throw new Error('Blockchain not configured or disabled');
    }
    const addr = CONSENT_MANAGER_ADDRESS;
    const runner = signer || hospitalSigner || provider;
    return new ethers.Contract(addr, consentAbi, runner);
  },
  getVaultContract(signer) {
    if (!provider || !INCENTIVE_VAULT_ADDRESS) {
      throw new Error('Blockchain not configured or disabled');
    }
    const addr = INCENTIVE_VAULT_ADDRESS;
    const runner = signer || hospitalSigner || provider;
    return new ethers.Contract(addr, vaultAbi, runner);
  },
  // helper to build a signer from a raw private key (DEV ONLY!)
  signerFromPrivateKey(pk) {
    if (!provider) {
      throw new Error('Blockchain provider not initialized');
    }
    return new ethers.Wallet(pk, provider);
  }
};
