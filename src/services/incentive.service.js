import { contracts } from '../config/web3.js';
import { ethers } from 'ethers';
import { config } from '../config/mode.js';

// In-memory incentive storage for non-blockchain mode
const incentiveStore = new Map();

export class IncentiveService {
  static async payout(payload) {
    const { patientAddress, ruleId } = payload;
    let txHash = null;

    // Blockchain payout (if enabled)
    if (config.features.incentives.blockchain) {
      const vault = contracts.getVaultContract();
      if (!vault.runner || !vault.runner.signer) {
        throw new Error('Server hospital signer not configured. Set HOSPITAL_PRIVATE_KEY.');
      }
      
      const ruleHash = ethers.id(ruleId);
      const tx = await vault.payout(patientAddress, ruleHash);
      const rcpt = await tx.wait();
      txHash = rcpt.hash;
    }

    // Database/In-memory incentive tracking
    const incentiveData = {
      patientAddress,
      ruleId,
      amount: payload.amount || 0,
      paidAt: new Date(),
      blockchainTxHash: txHash,
      blockchainEnabled: config.features.incentives.blockchain
    };

    if (config.blockchain.disabled) {
      // Store in memory for non-blockchain mode
      const incentiveKey = `${patientAddress}:${ruleId}:${Date.now()}`;
      incentiveStore.set(incentiveKey, incentiveData);
    }

    return { incentive: incentiveData, txHash };
  }

  static async getPayoutHistory(patientAddress) {
    if (config.blockchain.disabled) {
      const payouts = [];
      for (const [key, incentive] of incentiveStore.entries()) {
        if (key.startsWith(patientAddress + ':')) {
          payouts.push(incentive);
        }
      }
      return { payouts };
    }
    
    return { payouts: [] };
  }

  static async getAllPayouts() {
    if (config.blockchain.disabled) {
      const payouts = Array.from(incentiveStore.values());
      return { payouts };
    }
    
    return { payouts: [] };
  }

  static async getPayoutStatus(patientAddress, ruleId) {
    if (config.blockchain.disabled) {
      // Check if payout exists in memory
      for (const [key, incentive] of incentiveStore.entries()) {
        if (key.includes(patientAddress) && key.includes(ruleId)) {
          return {
            paid: true,
            incentive,
            blockchainEnabled: false
          };
        }
      }
      
      return {
        paid: false,
        blockchainEnabled: false
      };
    }

    return {
      paid: false,
      blockchainEnabled: true
    };
  }

  static async simulatePayout(payload) {
    const { patientAddress, ruleId, amount } = payload;
    
    return {
      simulation: {
        patientAddress,
        ruleId,
        amount: amount || 0,
        wouldSucceed: true,
        blockchainEnabled: config.features.incentives.blockchain
      }
    };
  }
}
