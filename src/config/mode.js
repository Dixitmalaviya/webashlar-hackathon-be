// Configuration for blockchain bypass mode
const BLOCKCHAIN_MODE = process.env.BLOCKCHAIN_MODE || 'disabled'; // 'enabled' | 'disabled' | 'hybrid'
console.log("BLOCKCHAIN_MODE",BLOCKCHAIN_MODE)

export const config = {
  // Blockchain mode configuration
  blockchain: {
    enabled: BLOCKCHAIN_MODE === 'enabled',
    disabled: BLOCKCHAIN_MODE === 'disabled',
    hybrid: BLOCKCHAIN_MODE === 'hybrid',
    mode: BLOCKCHAIN_MODE
  },
  
  // Feature flags for different components
  features: {
    identity: {
      blockchain: BLOCKCHAIN_MODE === 'enabled' || BLOCKCHAIN_MODE === 'hybrid',
      database: true
    },
    consent: {
      blockchain: BLOCKCHAIN_MODE === 'enabled' || BLOCKCHAIN_MODE === 'hybrid',
      database: true
    },
    records: {
      blockchain: BLOCKCHAIN_MODE === 'enabled' || BLOCKCHAIN_MODE === 'hybrid',
      database: true
    },
    incentives: {
      blockchain: BLOCKCHAIN_MODE === 'enabled' || BLOCKCHAIN_MODE === 'hybrid',
      database: true
    }
  }
};

export const isBlockchainEnabled = () => config.blockchain.enabled || config.blockchain.hybrid;
export const isBlockchainDisabled = () => config.blockchain.disabled;
export const isHybridMode = () => config.blockchain.hybrid;
