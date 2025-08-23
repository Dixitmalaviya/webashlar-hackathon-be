# Patient-Doctor Relationship Management Guide

This guide explains how the patient-doctor relationship system works, allowing patients to see all their doctors and doctors to see all their patients with complete medical data.

## 🏗️ **System Architecture**

### **Database Structure**
```
Database: healthcare
├── relationships (Patient-Doctor connections)
│   ├── patient: ObjectId (ref: Patient)
│   ├── doctor: ObjectId (ref: Doctor)
│   ├── hospital: ObjectId (ref: Hospital)
│   ├── relationshipType: String (primary_care, specialist, etc.)
│   ├── startDate: Date
│   ├── endDate: Date (null if active)
│   ├── isActive: Boolean
│   └── notes: String
│
├── patients (Patient data)
├── doctors (Doctor data)
├── hospitals (Hospital data)
├── medical_records (Records linked to patient-doctor)
└── reports (Reports linked to records)
```

## 🔄 **How It Works**

### **1. Patient Visits Multiple Doctors**
```
Patient1 → Doctor1 (Primary Care)
Patient1 → Doctor2 (Cardiologist)
Patient1 → Doctor3 (Dermatologist)
```

### **2. Data Access Flow**
- **Patient Login**: Can see all their doctors and related data
- **Doctor Login**: Can see all their patients and related data
- **Each relationship**: Contains medical records and reports

## 🛠️ **API Endpoints**

### **For Patients**

#### **Get All My Doctors**
```http
GET /api/relationships/my-doctors
Authorization: Bearer <patient_token>
```

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "relationshipId": "507f1f77bcf86cd799439015",
      "relationshipType": "primary_care",
      "startDate": "2024-01-15T10:00:00.000Z",
      "notes": "Primary care physician",
      "doctor": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "Dr. Sarah Smith",
        "licenseNumber": "MD123456",
        "specialization": "Cardiology",
        "phone": "+1234567892",
        "email": "sarah.smith@hospital.com",
        "yearsOfExperience": 10
      },
      "hospital": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "City General Hospital",
        "address": "456 Hospital Ave, City, State 12345",
        "phone": "+1234567893",
        "type": "General"
      }
    }
  ],
  "count": 1
}
```

#### **Get Specific Doctor Data (with Records & Reports)**
```http
GET /api/relationships/my-doctor/{doctorId}
Authorization: Bearer <patient_token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "relationship": {
      "relationshipId": "507f1f77bcf86cd799439015",
      "relationshipType": "primary_care",
      "startDate": "2024-01-15T10:00:00.000Z",
      "notes": "Primary care physician",
      "hospital": { ... }
    },
    "doctor": {
      "fullName": "Dr. Sarah Smith",
      "licenseNumber": "MD123456",
      "specialization": "Cardiology",
      "phone": "+1234567892",
      "email": "sarah.smith@hospital.com",
      "yearsOfExperience": 10
    },
    "medicalRecords": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "diagnosis": "Hypertension",
        "treatment": "Lisinopril 10mg daily",
        "prescription": "Lisinopril 10mg daily",
        "notes": "Patient shows improvement",
        "createdAt": "2024-01-20T10:00:00.000Z"
      }
    ],
    "reports": [
      {
        "recordId": "507f1f77bcf86cd799439014",
        "recordDiagnosis": "Hypertension",
        "reportId": "507f1f77bcf86cd799439016",
        "reportType": "blood_test",
        "reportFileUrl": "https://example.com/reports/blood_test_123.pdf",
        "reportData": {
          "hemoglobin": "14.2 g/dL",
          "white_blood_cells": "7.5 K/μL"
        },
        "createdAt": "2024-01-20T11:00:00.000Z"
      }
    ],
    "summary": {
      "totalRecords": 1,
      "totalReports": 1,
      "lastVisit": "2024-01-20T10:00:00.000Z",
      "relationshipDuration": 432000000
    }
  }
}
```

### **For Doctors**

#### **Get All My Patients**
```http
GET /api/relationships/my-patients
Authorization: Bearer <doctor_token>
```

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "relationshipId": "507f1f77bcf86cd799439015",
      "relationshipType": "primary_care",
      "startDate": "2024-01-15T10:00:00.000Z",
      "notes": "Primary care physician",
      "patient": {
        "_id": "507f1f77bcf86cd799439011",
        "fullName": "John Doe",
        "dob": "1990-01-01",
        "phone": "+1234567890",
        "email": "john@example.com",
        "address": "123 Main St, City, State 12345",
        "emergencyContact": {
          "name": "Jane Doe",
          "phone": "+1234567891",
          "relationship": "Spouse"
        }
      },
      "hospital": { ... }
    }
  ],
  "count": 1
}
```

#### **Get Specific Patient Data (with Records & Reports)**
```http
GET /api/relationships/my-patient/{patientId}
Authorization: Bearer <doctor_token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "relationship": {
      "relationshipId": "507f1f77bcf86cd799439015",
      "relationshipType": "primary_care",
      "startDate": "2024-01-15T10:00:00.000Z",
      "notes": "Primary care physician",
      "hospital": { ... }
    },
    "patient": {
      "fullName": "John Doe",
      "dob": "1990-01-01",
      "phone": "+1234567890",
      "email": "john@example.com",
      "address": "123 Main St, City, State 12345",
      "emergencyContact": { ... }
    },
    "medicalRecords": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "diagnosis": "Hypertension",
        "treatment": "Lisinopril 10mg daily",
        "prescription": "Lisinopril 10mg daily",
        "notes": "Patient shows improvement",
        "createdAt": "2024-01-20T10:00:00.000Z"
      }
    ],
    "reports": [
      {
        "recordId": "507f1f77bcf86cd799439014",
        "recordDiagnosis": "Hypertension",
        "reportId": "507f1f77bcf86cd799439016",
        "reportType": "blood_test",
        "reportFileUrl": "https://example.com/reports/blood_test_123.pdf",
        "reportData": {
          "hemoglobin": "14.2 g/dL",
          "white_blood_cells": "7.5 K/μL"
        },
        "createdAt": "2024-01-20T11:00:00.000Z"
      }
    ],
    "summary": {
      "totalRecords": 1,
      "totalReports": 1,
      "lastVisit": "2024-01-20T10:00:00.000Z",
      "relationshipDuration": 432000000
    }
  }
}
```

### **For Administrators**

#### **Create Relationship**
```http
POST /api/relationships
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "patientId": "507f1f77bcf86cd799439011",
  "doctorId": "507f1f77bcf86cd799439012",
  "hospitalId": "507f1f77bcf86cd799439013",
  "relationshipType": "primary_care",
  "notes": "Patient assigned to primary care physician"
}
```

#### **Get Relationship Statistics**
```http
GET /api/relationships/stats
Authorization: Bearer <user_token>
```

**For Patients:**
```json
{
  "ok": true,
  "data": {
    "totalDoctors": 3,
    "doctors": [
      {
        "doctorId": "507f1f77bcf86cd799439012",
        "doctorName": "Dr. Sarah Smith",
        "specialization": "Cardiology",
        "relationshipType": "primary_care",
        "startDate": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

**For Doctors:**
```json
{
  "ok": true,
  "data": {
    "totalPatients": 25,
    "patients": [
      {
        "patientId": "507f1f77bcf86cd799439011",
        "patientName": "John Doe",
        "dob": "1990-01-01",
        "relationshipType": "primary_care",
        "startDate": "2024-01-15T10:00:00.000Z"
      }
    ]
  }
}
```

## 🔐 **Security & Access Control**

### **Role-Based Access**
- **Patients**: Can only see their own doctors and data
- **Doctors**: Can only see their own patients and data
- **Admins**: Can see all relationships and manage them
- **Hospitals**: Can create relationships within their system

### **Data Privacy**
- All endpoints require authentication
- Users can only access data they're authorized to see
- Medical records are linked to specific patient-doctor relationships
- Reports are linked to specific medical records

## 📊 **Use Cases**

### **Use Case 1: Patient Dashboard**
1. Patient logs in
2. Calls `GET /api/relationships/my-doctors`
3. Sees list of all their doctors
4. Clicks on a doctor to see detailed data
5. Calls `GET /api/relationships/my-doctor/{doctorId}`
6. Views all medical records and reports for that doctor

### **Use Case 2: Doctor Dashboard**
1. Doctor logs in
2. Calls `GET /api/relationships/my-patients`
3. Sees list of all their patients
4. Clicks on a patient to see detailed data
5. Calls `GET /api/relationships/my-patient/{patientId}`
6. Views all medical records and reports for that patient

### **Use Case 3: Hospital Administration**
1. Admin logs in
2. Creates new patient-doctor relationship
3. Calls `POST /api/relationships`
4. Patient and doctor can now see each other's data

## 🔄 **Integration with Existing Systems**

### **Medical Records Integration**
- Medical records are automatically linked to patient-doctor relationships
- When creating a record, specify both patient and doctor
- Records are filtered by relationship

### **Reports Integration**
- Reports are linked to medical records
- Reports are automatically included in relationship data
- Full audit trail maintained

### **Consent Management**
- Relationships work with the consent system
- Doctors can only access patient data if relationship exists
- Consent can be granted/revoked per relationship

## 🧪 **Testing Scenarios**

### **Scenario 1: Patient with Multiple Doctors**
1. Create patient account
2. Create multiple doctor accounts
3. Create relationships between patient and doctors
4. Patient logs in and sees all doctors
5. Patient can access each doctor's data separately

### **Scenario 2: Doctor with Multiple Patients**
1. Create doctor account
2. Create multiple patient accounts
3. Create relationships between doctor and patients
4. Doctor logs in and sees all patients
5. Doctor can access each patient's data separately

### **Scenario 3: Data Isolation**
1. Create two patients and two doctors
2. Create relationships: Patient1-Doctor1, Patient2-Doctor2
3. Verify Patient1 cannot see Doctor2's data
4. Verify Doctor1 cannot see Patient2's data

## 📈 **Performance Considerations**

### **Database Indexes**
- Indexed on `patient`, `doctor`, `hospital`
- Indexed on `isActive` for filtering
- Unique index on `patient + doctor` combination

### **Query Optimization**
- Populate related data efficiently
- Use projection to select only needed fields
- Sort by creation date for recent data

### **Caching Strategy**
- Cache relationship lists for frequently accessed data
- Cache patient/doctor profiles
- Invalidate cache when relationships change

## 🚀 **Future Enhancements**

### **Planned Features**
- **Relationship History**: Track all past relationships
- **Specialization Filtering**: Filter doctors by specialization
- **Appointment Integration**: Link appointments to relationships
- **Notification System**: Notify when relationships change
- **Analytics Dashboard**: Relationship statistics and insights

### **Advanced Features**
- **Multi-Hospital Support**: Patients can have doctors at different hospitals
- **Temporary Relationships**: Emergency or consultation relationships
- **Relationship Permissions**: Granular access control per relationship
- **Audit Logging**: Track all relationship changes

---

## 🎯 **Quick Start Checklist**

- [ ] Set up Relationship model and database
- [ ] Create relationship service and controller
- [ ] Add relationship routes to main app
- [ ] Test patient-doctor relationship creation
- [ ] Test patient accessing doctor data
- [ ] Test doctor accessing patient data
- [ ] Verify data isolation and security
- [ ] Test with multiple relationships
- [ ] Integrate with medical records system
- [ ] Add to Postman collection for testing

Happy Relationship Management! 🔗✨
