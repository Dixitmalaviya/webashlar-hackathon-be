import { contracts } from '../config/web3.js';
import { ethers } from 'ethers';
import { config } from '../config/mode.js';

// In-memory consent storage for non-blockchain mode
const consentStore = new Map();

function signerFromHeader(req) {
  const pk = req.headers['x-user-private-key'];
  // Only create signer if blockchain is enabled
  if (config.features.consent.blockchain && pk) {
    return contracts.signerFromPrivateKey(pk);
  }
  return null;
}

function getConsentKey(patientAddress, granteeAddress, scope) {
  return `${patientAddress}:${granteeAddress}:${scope}`;
}

export class ConsentService {
  static async grantConsent(payload, req) {
    const { granteeAddress, scope, durationDays } = payload;
    let txHash = null;

    // Blockchain consent (if enabled)
    if (config.features.consent.blockchain) {
      const signer = signerFromHeader(req);
      if (!signer) {
        throw new Error('Missing x-user-private-key (patient)');
      }

      const cm = contracts.getConsentContract(signer);
      const scopeHash = ethers.id(scope);
      const tx = await cm.grantConsent(granteeAddress, scopeHash, BigInt(durationDays));
      const rcpt = await tx.wait();
      txHash = rcpt.hash;
    }

    // Database/In-memory consent storage
    const consentKey = getConsentKey(req.body.patientAddress || 'default', granteeAddress, scope);
    const consentData = {
      patientAddress: req.body.patientAddress || 'default',
      granteeAddress,
      scope,
      durationDays,
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      blockchainTxHash: txHash,
      blockchainEnabled: config.features.consent.blockchain
    };

    if (config.blockchain.disabled) {
      // Store in memory for non-blockchain mode
      consentStore.set(consentKey, consentData);
    }

    return { consent: consentData, txHash };
  }

  static async revokeConsent(payload, req) {
    const { granteeAddress, scope } = payload;
    let txHash = null;

    // Blockchain revocation (if enabled)
    if (config.features.consent.blockchain) {
      const signer = signerFromHeader(req);
      if (!signer) {
        throw new Error('Missing x-user-private-key (patient)');
      }

      const cm = contracts.getConsentContract(signer);
      const scopeHash = ethers.id(scope);
      const tx = await cm.revokeConsent(granteeAddress, scopeHash);
      const rcpt = await tx.wait();
      txHash = rcpt.hash;
    }

    // Database/In-memory consent removal
    const consentKey = getConsentKey(req.body.patientAddress || 'default', granteeAddress, scope);
    
    if (config.blockchain.disabled) {
      consentStore.delete(consentKey);
    }

    return { revoked: true, txHash };
  }

  static async checkConsent(patientAddress, requesterAddress, scope) {
    // Blockchain consent check (if enabled)
    if (config.features.consent.blockchain) {
      const cm = contracts.getConsentContract();
      const scopeHash = ethers.id(scope);
      const allowed = await cm.isAllowed(patientAddress, requesterAddress, scopeHash);
      return Boolean(allowed);
    }

    // In-memory consent check for non-blockchain mode
    if (config.blockchain.disabled) {
      const consentKey = getConsentKey(patientAddress, requesterAddress, scope);
      const consent = consentStore.get(consentKey);
      
      if (!consent) {
        return false;
      }

      // Check if consent has expired
      if (new Date() > consent.expiresAt) {
        consentStore.delete(consentKey);
        return false;
      }

      return true;
    }

    return false;
  }

  static async getAllConsents(patientAddress) {
    if (config.blockchain.disabled) {
      const consents = [];
      for (const [key, consent] of consentStore.entries()) {
        if (key.startsWith(patientAddress + ':')) {
          consents.push(consent);
        }
      }
      return consents;
    }
    
    return [];
  }

  static async getConsentStatus(patientAddress, requesterAddress, scope) {
    const isAllowed = await this.checkConsent(patientAddress, requesterAddress, scope);
    
    if (config.blockchain.disabled) {
      const consentKey = getConsentKey(patientAddress, requesterAddress, scope);
      const consent = consentStore.get(consentKey);
      
      return {
        allowed: isAllowed,
        consent: consent || null,
        blockchainEnabled: false
      };
    }

    return {
      allowed: isAllowed,
      blockchainEnabled: true
    };
  }
}
