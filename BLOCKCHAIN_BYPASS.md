# Blockchain Bypass Feature

This feature allows you to run the healthcare API with or without blockchain integration, making it flexible for different development and deployment scenarios.

## Configuration Modes

### Environment Variable: `BLOCKCHAIN_MODE`

Set this environment variable to control the blockchain behavior:

- **`enabled`** (default): Full blockchain integration
- **`disabled`**: No blockchain integration, uses in-memory storage
- **`hybrid`**: Blockchain integration with fallback to database

## How It Works

### 1. Identity Management

**Blockchain Mode (enabled/hybrid):**
- Registers patients, doctors, and hospitals on the blockchain
- Requires `x-user-private-key` header for transactions
- Stores blockchain transaction hashes in database

**Non-Blockchain Mode (disabled):**
- Stores all data in MongoDB only
- No private key required
- Simulates blockchain hashes for consistency

### 2. Consent Management

**Blockchain Mode:**
- Grants/revokes consent on smart contracts
- Checks consent status from blockchain

**Non-Blockchain Mode:**
- Uses in-memory storage for consent data
- Simulates blockchain behavior
- Data persists only during server runtime

### 3. Medical Records

**Blockchain Mode:**
- Creates blockchain hashes for records
- Stores transaction data

**Non-Blockchain Mode:**
- Stores records in MongoDB only
- Generates hashes for consistency

### 4. Incentives

**Blockchain Mode:**
- Processes payouts through smart contracts
- Requires hospital private key

**Non-Blockchain Mode:**
- Simulates payouts in memory
- No actual cryptocurrency transactions

## API Endpoints

### Status Endpoints

```
GET /api/status/status
GET /api/status/blockchain-config
```

### Identity Endpoints

```
POST /api/identity/patient/register
POST /api/identity/doctor/register
POST /api/identity/hospital/register
GET /api/identity/patient/:id
GET /api/identity/doctor/:id
GET /api/identity/hospital/:id
GET /api/identity/patients
GET /api/identity/doctors
GET /api/identity/hospitals
```

### Consent Endpoints

```
POST /api/consent/grant
POST /api/consent/revoke
GET /api/consent/check
GET /api/consent/status
GET /api/consent/patient/:patientAddress
```

### Record Endpoints

```
POST /api/records/
POST /api/records/report
GET /api/records/
GET /api/records/:id
GET /api/records/patient/:patientId
GET /api/records/doctor/:doctorId
GET /api/records/hospital/:hospitalId
PUT /api/records/:id
DELETE /api/records/:id
```

### Incentive Endpoints

```
POST /api/incentives/payout
POST /api/incentives/simulate
GET /api/incentives/history/:patientAddress
GET /api/incentives/all
GET /api/incentives/status
```

## Usage Examples

### 1. Enable Blockchain Mode

```bash
export BLOCKCHAIN_MODE=enabled
npm start
```

### 2. Disable Blockchain Mode

```bash
export BLOCKCHAIN_MODE=disabled
npm start
```

### 3. Hybrid Mode

```bash
export BLOCKCHAIN_MODE=hybrid
npm start
```

## Response Format

All API responses now include a `blockchainEnabled` field indicating whether blockchain is active:

```json
{
  "ok": true,
  "data": {...},
  "blockchainEnabled": true,
  "txHash": "0x..." // only when blockchain is enabled
}
```

## Environment Variables

### Required for Blockchain Mode

```bash
RPC_URL=your_ethereum_rpc_url
IDENTITY_REGISTRY_ADDRESS=contract_address
CONSENT_MANAGER_ADDRESS=contract_address
INCENTIVE_VAULT_ADDRESS=contract_address
HOSPITAL_PRIVATE_KEY=private_key
```

### Optional

```bash
BLOCKCHAIN_MODE=enabled|disabled|hybrid
```

## Development Workflow

1. **Development without Blockchain:**
   ```bash
   export BLOCKCHAIN_MODE=disabled
   npm run dev
   ```

2. **Testing with Blockchain:**
   ```bash
   export BLOCKCHAIN_MODE=enabled
   # Set up local blockchain (Ganache, Hardhat, etc.)
   npm run dev
   ```

3. **Production with Fallback:**
   ```bash
   export BLOCKCHAIN_MODE=hybrid
   # Configure production blockchain
   npm start
   ```

## Benefits

1. **Development Speed**: No blockchain setup required for basic development
2. **Testing Flexibility**: Easy switching between modes
3. **Production Reliability**: Hybrid mode provides fallback
4. **Cost Efficiency**: No gas fees in disabled mode
5. **Consistency**: Same API interface regardless of mode

## Migration

When switching from disabled to enabled mode:

1. Existing database records will work normally
2. New operations will use blockchain
3. No data migration required
4. Blockchain hashes will be generated for new records

## Security Considerations

- **Disabled Mode**: No blockchain security guarantees
- **Enabled Mode**: Full blockchain security
- **Hybrid Mode**: Blockchain security with database fallback
- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use secure environment variable management
