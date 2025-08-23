# Healthcare Chain API

A blockchain-powered healthcare API with flexible blockchain integration that can work with or without blockchain technology.

## 🚀 Features

- **Flexible Blockchain Integration**: Run with full blockchain, without blockchain, or in hybrid mode
- **Identity Management**: Register patients, doctors, and hospitals
- **Consent Management**: Grant and revoke data access permissions
- **Medical Records**: Create and manage medical records with blockchain hashing
- **Incentive System**: Process healthcare incentives and payouts
- **RESTful API**: Clean, consistent API interface

## 🔧 Blockchain Modes

### 1. **Enabled Mode** (Default)
- Full blockchain integration
- All operations use smart contracts
- Requires blockchain configuration

### 2. **Disabled Mode**
- No blockchain integration
- Uses database and in-memory storage
- Perfect for development and testing

### 3. **Hybrid Mode**
- Blockchain with database fallback
- Best of both worlds for production

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- (Optional) Ethereum node for blockchain mode

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd webashlar-hackathon-be

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### Environment Configuration

```bash
# Blockchain Mode (choose one)
BLOCKCHAIN_MODE=enabled    # Full blockchain
BLOCKCHAIN_MODE=disabled   # No blockchain
BLOCKCHAIN_MODE=hybrid     # Hybrid mode

# Database
MONGODB_URI=mongodb://localhost:27017/healthcare-chain

# Blockchain (required for enabled/hybrid mode)
RPC_URL=http://localhost:8545
IDENTITY_REGISTRY_ADDRESS=0x...
CONSENT_MANAGER_ADDRESS=0x...
INCENTIVE_VAULT_ADDRESS=0x...
HOSPITAL_PRIVATE_KEY=0x...
```

## 📚 API Documentation

### Status Endpoints
- `GET /api/status/status` - System status and configuration
- `GET /api/status/blockchain-config` - Blockchain configuration details

### Identity Management
- `POST /api/identity/patient/register` - Register a patient
- `POST /api/identity/doctor/register` - Register a doctor
- `POST /api/identity/hospital/register` - Register a hospital
- `GET /api/identity/patients` - List all patients
- `GET /api/identity/doctors` - List all doctors
- `GET /api/identity/hospitals` - List all hospitals

### Consent Management
- `POST /api/consent/grant` - Grant consent
- `POST /api/consent/revoke` - Revoke consent
- `GET /api/consent/check` - Check consent status
- `GET /api/consent/status` - Get detailed consent status

### Medical Records
- `POST /api/records/` - Create medical record
- `GET /api/records/` - List all records
- `GET /api/records/:id` - Get specific record
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record

### Incentives
- `POST /api/incentives/payout` - Process payout
- `POST /api/incentives/simulate` - Simulate payout
- `GET /api/incentives/history/:patientAddress` - Get payout history

## 🧪 Testing

Run the test script to verify the blockchain bypass feature:

```bash
node test-bypass.js
```

## 📖 Documentation

For detailed documentation on the blockchain bypass feature, see [BLOCKCHAIN_BYPASS.md](./BLOCKCHAIN_BYPASS.md).

## 🔒 Security

- Private keys should never be committed to version control
- Use environment variables for sensitive configuration
- Blockchain mode provides additional security guarantees
- Disabled mode is suitable for development only

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.