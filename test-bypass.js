// Test script to demonstrate blockchain bypass feature
// Run with: node test-bypass.js

const BASE_URL = 'http://localhost:3333';

async function testAPI() {
  console.log('🚀 Testing Healthcare API with Blockchain Bypass Feature\n');

  // Test 1: Check system status
  console.log('1. Checking system status...');
  try {
    const statusResponse = await fetch(`${BASE_URL}/api/status/status`);
    const status = await statusResponse.json();
    console.log('✅ Status:', status.blockchain.mode);
    console.log('   Features:', Object.keys(status.features).join(', '));
  } catch (error) {
    console.log('❌ Status check failed:', error.message);
  }

  // Test 2: Register a patient (without blockchain)
  console.log('\n2. Registering a patient...');
  try {
    const patientData = {
      fullName: 'John Doe',
      dob: '1990-01-01',
      email: 'john@example.com',
      phone: '+1234567890',
      address: '123 Main St',
      walletAddress: '0x1234567890123456789012345678901234567890'
    };

    const response = await fetch(`${BASE_URL}/api/identity/patient/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    });

    const result = await response.json();
    console.log('✅ Patient registered:', result.blockchainEnabled ? 'with blockchain' : 'without blockchain');
    if (result.txHash) {
      console.log('   Transaction hash:', result.txHash);
    }
  } catch (error) {
    console.log('❌ Patient registration failed:', error.message);
  }

  // Test 3: Create a medical record
  console.log('\n3. Creating a medical record...');
  try {
    const recordData = {
      patient: '507f1f77bcf86cd799439011', // Replace with actual patient ID
      doctor: '507f1f77bcf86cd799439012',   // Replace with actual doctor ID
      hospital: '507f1f77bcf86cd799439013', // Replace with actual hospital ID
      diagnosis: 'Common cold',
      treatment: 'Rest and fluids',
      prescription: 'Over-the-counter medication',
      notes: 'Patient should rest for 3-5 days',
      consentScope: 'general'
    };

    const response = await fetch(`${BASE_URL}/api/records/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(recordData)
    });

    const result = await response.json();
    console.log('✅ Medical record created:', result.blockchainEnabled ? 'with blockchain' : 'without blockchain');
  } catch (error) {
    console.log('❌ Medical record creation failed:', error.message);
  }

  // Test 4: Grant consent
  console.log('\n4. Granting consent...');
  try {
    const consentData = {
      patientAddress: '0x1234567890123456789012345678901234567890',
      granteeAddress: '0x0987654321098765432109876543210987654321',
      scope: 'medical_records',
      durationDays: 30
    };

    const response = await fetch(`${BASE_URL}/api/consent/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(consentData)
    });

    const result = await response.json();
    console.log('✅ Consent granted:', result.blockchainEnabled ? 'with blockchain' : 'without blockchain');
    if (result.txHash) {
      console.log('   Transaction hash:', result.txHash);
    }
  } catch (error) {
    console.log('❌ Consent grant failed:', error.message);
  }

  // Test 5: Check consent
  console.log('\n5. Checking consent...');
  try {
    const response = await fetch(`${BASE_URL}/api/consent/check?patientAddress=0x1234567890123456789012345678901234567890&requesterAddress=0x0987654321098765432109876543210987654321&scope=medical_records`);
    const result = await response.json();
    console.log('✅ Consent check:', result.allowed ? 'ALLOWED' : 'DENIED');
    console.log('   Blockchain enabled:', result.blockchainEnabled);
  } catch (error) {
    console.log('❌ Consent check failed:', error.message);
  }

  // Test 6: Simulate incentive payout
  console.log('\n6. Simulating incentive payout...');
  try {
    const payoutData = {
      patientAddress: '0x1234567890123456789012345678901234567890',
      ruleId: 'regular_checkup',
      amount: 100
    };

    const response = await fetch(`${BASE_URL}/api/incentives/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payoutData)
    });

    const result = await response.json();
    console.log('✅ Payout simulation:', result.simulation.wouldSucceed ? 'SUCCESS' : 'FAILED');
    console.log('   Amount:', result.simulation.amount);
    console.log('   Blockchain enabled:', result.blockchainEnabled);
  } catch (error) {
    console.log('❌ Payout simulation failed:', error.message);
  }

  console.log('\n🎉 Test completed!');
  console.log('\nTo switch blockchain modes:');
  console.log('  export BLOCKCHAIN_MODE=disabled  # No blockchain');
  console.log('  export BLOCKCHAIN_MODE=enabled   # Full blockchain');
  console.log('  export BLOCKCHAIN_MODE=hybrid    # Hybrid mode');
}

// Run the test
testAPI().catch(console.error);
