# Hospital Authentication & Relationship Management Guide

This guide explains how hospitals can register, login, and manage patient-doctor relationships in the healthcare system.

## 🏥 **Hospital Authentication Flow**

### **1. Hospital Registration**

Hospitals must first register to get access to the system:

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "admin@cityhospital.com",
  "password": "password123",
  "walletAddress": "0x1111111111111111111111111111111111111111",
  "role": "hospital",
  "name": "City General Hospital",
  "registrationNumber": "HOSP001",
  "phone": "+1234567893",
  "address": "456 Hospital Ave, City, State 12345",
  "type": "General",
  "capacity": 500
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Hospital registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439020",
      "email": "admin@cityhospital.com",
      "role": "hospital",
      "entityId": "507f1f77bcf86cd799439013",
      "entityModel": "Hospital",
      "walletAddress": "0x1111111111111111111111111111111111111111"
    },
    "hospital": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "City General Hospital",
      "registrationNumber": "HOSP001",
      "phone": "+1234567893",
      "address": "456 Hospital Ave, City, State 12345",
      "type": "General",
      "capacity": 500
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **2. Hospital Login**

After registration, hospitals can login:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@cityhospital.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439020",
      "email": "admin@cityhospital.com",
      "role": "hospital",
      "entityId": "507f1f77bcf86cd799439013",
      "entityModel": "Hospital"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 🔗 **Hospital Relationship Management**

### **3. Create Patient-Doctor Relationships**

Once logged in, hospitals can create relationships between patients and doctors:

```http
POST /api/relationships
Authorization: Bearer <hospital_token>
Content-Type: application/json

{
  "patientId": "507f1f77bcf86cd799439011",
  "doctorId": "507f1f77bcf86cd799439012",
  "hospitalId": "507f1f77bcf86cd799439013",
  "relationshipType": "primary_care",
  "notes": "Patient assigned to primary care physician"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Patient-doctor relationship created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "patient": "507f1f77bcf86cd799439011",
    "doctor": "507f1f77bcf86cd799439012",
    "hospital": "507f1f77bcf86cd799439013",
    "relationshipType": "primary_care",
    "startDate": "2024-01-15T10:00:00.000Z",
    "isActive": true,
    "notes": "Patient assigned to primary care physician"
  },
  "txHash": "blockchain_hash_1705315200000"
}
```

### **4. View Hospital Relationships**

Hospitals can view all relationships within their hospital:

```http
GET /api/relationships/hospital/relationships
Authorization: Bearer <hospital_token>
```

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "relationshipType": "primary_care",
      "startDate": "2024-01-15T10:00:00.000Z",
      "isActive": true,
      "notes": "Primary care physician",
      "patient": {
        "_id": "507f1f77bcf86cd799439011",
        "fullName": "John Doe",
        "dob": "1990-01-01",
        "phone": "+1234567890",
        "email": "john@example.com"
      },
      "doctor": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "Dr. Sarah Smith",
        "specialization": "Cardiology",
        "phone": "+1234567892",
        "email": "sarah.smith@hospital.com"
      }
    }
  ],
  "count": 1
}
```

### **5. Get Hospital Statistics**

Hospitals can view relationship statistics:

```http
GET /api/relationships/hospital/stats
Authorization: Bearer <hospital_token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "totalRelationships": 150,
    "activeRelationships": 145,
    "uniquePatients": 120,
    "uniqueDoctors": 25
  }
}
```

## 🔐 **Security & Access Control**

### **Hospital Permissions**

- **Can Create**: Patient-doctor relationships within their hospital
- **Can View**: All relationships within their hospital
- **Can Manage**: Relationship notes and status
- **Cannot Access**: Relationships from other hospitals
- **Cannot Access**: Individual patient/doctor data outside relationships

### **Role-Based Access**

```javascript
// Hospital users can only access their own hospital's data
if (req.user.role === 'hospital') {
  // Filter by hospital ID
  const hospitalId = req.user.entityId;
  // Only show relationships where hospital matches
}
```

## 📊 **Complete Hospital Workflow**

### **Step 1: Hospital Registration**
1. Hospital admin registers with hospital details
2. System creates Hospital entity and User account
3. Hospital receives JWT token

### **Step 2: Patient & Doctor Registration**
1. Patients register through `/api/auth/register` (role: "patient")
2. Doctors register through `/api/auth/register` (role: "doctor")
3. Both are linked to the hospital during registration

### **Step 3: Create Relationships**
1. Hospital admin logs in
2. Creates relationships between patients and doctors
3. Uses `POST /api/relationships` endpoint

### **Step 4: Monitor Relationships**
1. View all relationships: `GET /api/relationships/hospital/relationships`
2. View statistics: `GET /api/relationships/hospital/stats`
3. Update relationship notes as needed

## 🏗️ **Database Structure**

### **Hospital User Model**
```javascript
{
  _id: ObjectId,
  email: "admin@cityhospital.com",
  password: "hashed_password",
  role: "hospital",
  entityId: ObjectId, // References Hospital collection
  entityModel: "Hospital",
  walletAddress: "0x1111111111111111111111111111111111111111",
  isActive: true
}
```

### **Hospital Entity Model**
```javascript
{
  _id: ObjectId,
  name: "City General Hospital",
  registrationNumber: "HOSP001",
  email: "admin@cityhospital.com",
  phone: "+1234567893",
  address: "456 Hospital Ave, City, State 12345",
  type: "General",
  capacity: 500,
  walletAddress: "0x1111111111111111111111111111111111111111"
}
```

### **Relationship Model**
```javascript
{
  _id: ObjectId,
  patient: ObjectId, // References Patient
  doctor: ObjectId,  // References Doctor
  hospital: ObjectId, // References Hospital (created by)
  relationshipType: "primary_care",
  startDate: Date,
  endDate: Date, // null if active
  isActive: true,
  notes: "Relationship notes"
}
```

## 🧪 **Testing Scenarios**

### **Scenario 1: Hospital Registration & Login**
1. Register hospital with valid details
2. Login with registered credentials
3. Verify JWT token is received
4. Verify hospital role and entityId

### **Scenario 2: Create Relationships**
1. Hospital logs in
2. Create relationship between patient and doctor
3. Verify relationship is created with hospital ID
4. Verify patient and doctor can now see each other

### **Scenario 3: View Hospital Data**
1. Hospital logs in
2. View all relationships in hospital
3. View hospital statistics
4. Verify only hospital's relationships are shown

### **Scenario 4: Data Isolation**
1. Create two hospitals
2. Create relationships in each hospital
3. Verify Hospital A cannot see Hospital B's relationships
4. Verify data isolation is maintained

## 🚀 **Hospital Dashboard Features**

### **Available Endpoints for Hospitals**

1. **Authentication**
   - `POST /api/auth/register` - Register hospital
   - `POST /api/auth/login` - Login hospital
   - `GET /api/auth/profile` - Get hospital profile

2. **Relationship Management**
   - `POST /api/relationships` - Create relationship
   - `GET /api/relationships/hospital/relationships` - View all relationships
   - `GET /api/relationships/hospital/stats` - View statistics
   - `PUT /api/relationships/:id/notes` - Update relationship notes
   - `PUT /api/relationships/:id/end` - End relationship

3. **Medical Records** (if authorized)
   - `GET /api/records/hospital/:hospitalId` - View hospital records
   - `POST /api/records` - Create medical records

## 📋 **Quick Start Checklist for Hospitals**

- [ ] Register hospital account
- [ ] Login and verify access
- [ ] Register patients and doctors
- [ ] Create patient-doctor relationships
- [ ] View relationship dashboard
- [ ] Monitor relationship statistics
- [ ] Test data isolation
- [ ] Verify security permissions

## 🔧 **Environment Setup**

### **Required Environment Variables**
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Database
MONGODB_URI=mongodb://localhost:27017/healthcare

# Blockchain (optional)
BLOCKCHAIN_MODE=disabled
RPC_URL=http://localhost:8545
```

## 🎯 **Best Practices**

### **Hospital Administration**
1. **Secure Registration**: Use strong passwords and secure email
2. **Regular Monitoring**: Check relationship statistics regularly
3. **Data Validation**: Verify patient and doctor details before creating relationships
4. **Access Control**: Limit hospital admin access to authorized personnel only

### **Security Considerations**
1. **Token Management**: Store JWT tokens securely
2. **Role Verification**: Always verify hospital role before operations
3. **Data Privacy**: Ensure patient data is protected
4. **Audit Logging**: Track all relationship changes

---

## 🎉 **Summary**

Hospitals can:
- ✅ Register and login with their own credentials
- ✅ Create patient-doctor relationships within their hospital
- ✅ View all relationships in their hospital
- ✅ Monitor relationship statistics
- ✅ Manage relationship notes and status
- ✅ Access hospital-specific data only

The system ensures proper data isolation and security while providing hospitals with comprehensive relationship management capabilities.

Happy Hospital Management! 🏥✨
