# Postman Testing Guide for Healthcare Chain API

This guide will help you test all endpoints of the Healthcare Chain API using the provided Postman collection.

## 🚀 Quick Start

### 1. Import the Collection
1. Open Postman
2. Click "Import" button
3. Select the `Healthcare-API-Postman-Collection.json` file
4. The collection will be imported with all endpoints organized by category

### 2. Set Up Environment Variables
The collection uses variables to make testing easier. Update these in the collection variables:

- **`base_url`**: `http://localhost:3333` (default)
- **`auth_token`**: JWT token from login response (will be updated automatically)
- **`reset_token`**: Reset token from forgot password response
- **`user_private_key`**: Your test private key (for blockchain mode)
- **`patient_id`**: Will be updated after patient registration
- **`doctor_id`**: Will be updated after doctor registration
- **`hospital_id`**: Will be updated after hospital registration
- **`record_id`**: Will be updated after record creation

## 📋 Testing Workflow

### Step 1: Check System Status
1. **Get System Status** - Verify the API is running and check blockchain mode
2. **Get Blockchain Config** - Check blockchain configuration status

### Step 2: Authentication (Start Here)
1. **Register Patient** - Create a patient account with authentication
2. **Register Doctor** - Create a doctor account with authentication
3. **Register Hospital** - Create a hospital account with authentication
4. **Login** - Test login with created accounts
5. **Get Profile** - Verify authentication works

### Step 3: Identity Management
1. **Get All** endpoints - Verify registrations work with authentication

### Step 4: Medical Records
1. **Create Medical Record** - Create a record using the IDs from Step 3
2. **Attach Report** - Add a report to the record
3. **Get Records** - Test various record retrieval endpoints

### Step 5: Consent Management
1. **Grant Consent** - Grant access permissions
2. **Check Consent** - Verify consent is working
3. **Get Consent Status** - Get detailed consent information

### Step 6: Incentives
1. **Simulate Payout** - Test payout simulation
2. **Process Payout** - Process actual payout (if blockchain enabled)
3. **Get Payout History** - Check payout records

## 🔧 Testing Different Modes

### Blockchain Disabled Mode (Recommended for Development)
```bash
export BLOCKCHAIN_MODE=disabled
npm run dev
```

**What to expect:**
- No `x-user-private-key` header required
- All operations work with database only
- `blockchainEnabled: false` in responses
- No transaction hashes

### Blockchain Enabled Mode
```bash
export BLOCKCHAIN_MODE=enabled
# Set up blockchain environment variables
npm run dev
```

**What to expect:**
- `x-user-private-key` header required for write operations
- `blockchainEnabled: true` in responses
- Transaction hashes in responses
- Full blockchain integration

### Hybrid Mode
```bash
export BLOCKCHAIN_MODE=hybrid
npm run dev
```

**What to expect:**
- Blockchain with database fallback
- Best of both worlds

## 📝 Testing Scenarios

### Scenario 1: Complete Patient Journey (Disabled Mode)
1. **Register Patient** → Get `auth_token` and `patient_id`
2. **Register Hospital** → Get `hospital_id`
3. **Register Doctor** → Get `doctor_id` 
4. **Login** → Verify authentication
5. **Create Medical Record** → Get `record_id`
6. **Attach Report** to the record
7. **Grant Consent** for data access
8. **Check Consent** status
9. **Simulate Incentive** payout

### Scenario 2: Blockchain Mode Testing
1. Set `BLOCKCHAIN_MODE=enabled`
2. Configure blockchain environment variables
3. Use valid private key in `x-user-private-key` header
4. Follow same workflow as Scenario 1
5. Verify transaction hashes in responses

### Scenario 3: Error Handling
1. Try registering without required fields
2. Test with invalid IDs
3. Test consent with non-existent addresses
4. Test blockchain operations without private key

## 🔍 Response Validation

### Expected Response Format
```json
{
  "ok": true,
  "data": {...},
  "blockchainEnabled": true/false,
  "txHash": "0x..." // only when blockchain enabled
}
```

### Status Codes
- **200**: Success
- **400**: Bad Request (missing fields, invalid data)
- **404**: Not Found (invalid IDs)
- **500**: Server Error

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure server is running on port 3333
   - Check if MongoDB is connected

2. **Missing Private Key Error**
   - In blockchain mode, add `x-user-private-key` header
   - In disabled mode, remove the header

3. **Invalid ID Errors**
   - Update collection variables with actual IDs from responses
   - Use the IDs returned from registration endpoints

4. **Blockchain Configuration Errors**
   - Check environment variables
   - Verify RPC URL is accessible
   - Ensure contract addresses are correct

### Debug Tips

1. **Check Server Logs**
   - Monitor console output for errors
   - Look for blockchain initialization messages

2. **Verify Environment**
   - Test status endpoints first
   - Check blockchain configuration endpoint

3. **Update Variables**
   - Copy IDs from successful responses
   - Update collection variables accordingly

## 📊 Testing Checklist

### Status Endpoints
- [ ] Get System Status
- [ ] Get Blockchain Config

### Authentication
- [ ] Register Patient
- [ ] Register Doctor
- [ ] Register Hospital
- [ ] Login
- [ ] Get Profile
- [ ] Update Profile
- [ ] Change Password
- [ ] Forgot Password
- [ ] Reset Password
- [ ] Refresh Token
- [ ] Logout
- [ ] Verify Token

### Identity Management
- [ ] Get Patient by ID
- [ ] Get Doctor by ID
- [ ] Get Hospital by ID
- [ ] Get All Patients
- [ ] Get All Doctors
- [ ] Get All Hospitals

### Medical Records
- [ ] Create Medical Record
- [ ] Attach Report
- [ ] Get All Records
- [ ] Get Record by ID
- [ ] Get Records by Patient
- [ ] Get Records by Doctor
- [ ] Get Records by Hospital
- [ ] Update Record
- [ ] Delete Record

### Consent Management
- [ ] Grant Consent
- [ ] Revoke Consent
- [ ] Check Consent
- [ ] Get Consent Status
- [ ] Get All Consents for Patient

### Incentives
- [ ] Process Payout
- [ ] Simulate Payout
- [ ] Get Payout History
- [ ] Get All Payouts
- [ ] Get Payout Status

## 🎯 Advanced Testing

### Load Testing
- Use Postman's Runner feature
- Test concurrent requests
- Monitor response times

### Security Testing
- Test with invalid private keys
- Test with malformed data
- Test authorization scenarios

### Integration Testing
- Test complete workflows
- Verify data consistency
- Test error recovery

## 📈 Performance Monitoring

### Key Metrics to Monitor
- Response times
- Success rates
- Error rates
- Blockchain transaction times (if enabled)

### Tools
- Postman Console
- Server logs
- Database monitoring
- Blockchain explorer (if enabled)

## 🔄 Continuous Testing

### Automated Testing
- Export collection to Newman
- Set up CI/CD pipeline
- Run tests automatically

### Regression Testing
- Test after code changes
- Verify all endpoints still work
- Check backward compatibility

---

## 🎉 Success Criteria

Your API is working correctly when:
- ✅ All endpoints return 200 status codes
- ✅ Response format is consistent
- ✅ Data is properly stored and retrieved
- ✅ Blockchain mode switching works
- ✅ Error handling is appropriate
- ✅ Performance is acceptable

Happy Testing! 🚀
