# Medical Reports API Guide

This guide provides comprehensive documentation for the Medical Reports API system, which manages medical reports, test results, and diagnostic findings in the healthcare system.

## 🏗️ **System Architecture**

### **Database Structure**
```
Database: healthcare
├── reports (Medical reports collection)
│   ├── reportType: String (blood_test, x_ray, mri_scan, etc.)
│   ├── title: String (Report title)
│   ├── description: String (Report description)
│   ├── patient: ObjectId (ref: Patient)
│   ├── doctor: ObjectId (ref: Doctor)
│   ├── hospital: ObjectId (ref: Hospital)
│   ├── medicalRecord: ObjectId (ref: MedicalRecord, optional)
│   ├── testDate: Date (When test was performed)
│   ├── reportDate: Date (When report was created)
│   ├── status: String (pending, in_progress, completed, reviewed, archived)
│   ├── reportData: Mixed (Raw test data)
│   ├── results: Mixed (Processed results with normal ranges)
│   ├── findings: String (Doctor's findings)
│   ├── recommendations: String (Treatment recommendations)
│   ├── isCritical: Boolean (Critical values flag)
│   ├── criticalValues: Array (Critical parameters)
│   ├── accessLevel: String (private, patient, doctor, hospital, public)
│   ├── blockchainHash: String (For blockchain integration)
│   └── createdBy: ObjectId (ref: User)
```

## 🔗 **API Endpoints**

### **Base URL**
```
http://localhost:3333/api/reports
```

### **Authentication**
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## 📋 **Core CRUD Operations**

### **1. Create Report**
```http
POST /api/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "patientId": "507f1f77bcf86cd799439011",
  "doctorId": "507f1f77bcf86cd799439012",
  "hospitalId": "507f1f77bcf86cd799439013",
  "reportType": "blood_test",
  "title": "Complete Blood Count",
  "description": "Routine blood test for health checkup",
  "testDate": "2024-01-15",
  "reportData": {
    "hemoglobin": "14.2 g/dL",
    "white_blood_cells": "7.5 K/μL",
    "platelets": "250 K/μL"
  },
  "results": {
    "hemoglobin": {
      "value": "14.2",
      "unit": "g/dL",
      "normal_range": "12.0-15.5",
      "status": "normal"
    }
  },
  "findings": "All parameters within normal range",
  "recommendations": "Continue with regular health monitoring",
  "isCritical": false,
  "accessLevel": "patient",
  "tags": ["routine", "blood_test"]
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Medical report created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "reportType": "blood_test",
    "title": "Complete Blood Count",
    "patient": "507f1f77bcf86cd799439011",
    "doctor": "507f1f77bcf86cd799439012",
    "hospital": "507f1f77bcf86cd799439013",
    "testDate": "2024-01-15T00:00:00.000Z",
    "status": "pending",
    "isCritical": false,
    "blockchainHash": "abc123...",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "txHash": "0x123..."
}
```

### **2. Get Report by ID**
```http
GET /api/reports/507f1f77bcf86cd799439016
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "reportType": "blood_test",
    "title": "Complete Blood Count",
    "description": "Routine blood test for health checkup",
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
      "email": "sarah@hospital.com"
    },
    "hospital": {
      "_id": "507f1f77bcf86cd799439013",
      "name": "City General Hospital",
      "phone": "+1234567893",
      "address": "456 Hospital Ave"
    },
    "testDate": "2024-01-15T00:00:00.000Z",
    "reportDate": "2024-01-15T10:00:00.000Z",
    "status": "completed",
    "results": {
      "hemoglobin": {
        "value": "14.2",
        "unit": "g/dL",
        "normal_range": "12.0-15.5",
        "status": "normal"
      }
    },
    "findings": "All parameters within normal range",
    "recommendations": "Continue with regular health monitoring",
    "isCritical": false,
    "accessLevel": "patient",
    "tags": ["routine", "blood_test"],
    "blockchainHash": "abc123...",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### **3. Get All Reports (with filtering)**
```http
GET /api/reports?page=1&limit=10&reportType=blood_test&status=completed&isCritical=false
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `reportType`: Filter by report type
- `status`: Filter by status
- `isCritical`: Filter by critical flag (true/false)
- `startDate`: Filter by test date range
- `endDate`: Filter by test date range
- `sortBy`: Sort field (default: reportDate)
- `sortOrder`: Sort order (asc/desc, default: desc)

**Response:**
```json
{
  "ok": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "reportType": "blood_test",
      "title": "Complete Blood Count",
      "patient": {
        "_id": "507f1f77bcf86cd799439011",
        "fullName": "John Doe",
        "dob": "1990-01-01"
      },
      "doctor": {
        "_id": "507f1f77bcf86cd799439012",
        "fullName": "Dr. Sarah Smith",
        "specialization": "Cardiology"
      },
      "hospital": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "City General Hospital"
      },
      "testDate": "2024-01-15T00:00:00.000Z",
      "status": "completed",
      "isCritical": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### **4. Update Report**
```http
PUT /api/reports/507f1f77bcf86cd799439016
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Complete Blood Count",
  "findings": "Updated findings with additional analysis",
  "recommendations": "Follow up in 3 months",
  "status": "reviewed"
}
```

### **5. Delete Report**
```http
DELETE /api/reports/507f1f77bcf86cd799439016
Authorization: Bearer <token>
```

---

## 🔍 **Specialized Endpoints**

### **1. Get My Reports**
```http
GET /api/reports/my-reports?page=1&limit=10&status=completed
Authorization: Bearer <token>
```
Returns reports based on user role:
- **Patient**: Their own reports
- **Doctor**: Reports they created
- **Hospital**: Reports from their hospital
- **Admin**: All reports

### **2. Get Reports by Patient**
```http
GET /api/reports/patient/507f1f77bcf86cd799439011?status=completed&reportType=blood_test
Authorization: Bearer <token>
```

### **3. Get Reports by Doctor**
```http
GET /api/reports/doctor/507f1f77bcf86cd799439012?status=completed
Authorization: Bearer <token>
```

### **4. Get Reports by Hospital**
```http
GET /api/reports/hospital/507f1f77bcf86cd799439013?page=1&limit=10
Authorization: Bearer <token>
```

### **5. Get Critical Reports**
```http
GET /api/reports/critical/all?hospitalId=507f1f77bcf86cd799439013
Authorization: Bearer <token>
```

### **6. Search Reports**
```http
GET /api/reports/search?q=blood&reportType=blood_test&limit=10
Authorization: Bearer <token>
```
Searches in title, description, findings, recommendations, notes, and tags.

---

## 📊 **Statistics & Analytics**

### **1. Get Report Statistics**
```http
GET /api/reports/stats/all?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "totalReports": 150,
    "criticalReports": 5,
    "pendingReports": 20,
    "completedReports": 125,
    "reportsByType": [
      {
        "_id": "blood_test",
        "count": 80
      },
      {
        "_id": "x_ray",
        "count": 45
      },
      {
        "_id": "mri_scan",
        "count": 25
      }
    ]
  }
}
```

### **2. Get My Report Statistics**
```http
GET /api/reports/my-stats
Authorization: Bearer <token>
```

---

## 🏷️ **Report Actions**

### **1. Mark Report as Reviewed**
```http
PUT /api/reports/507f1f77bcf86cd799439016/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "reviewNotes": "Report reviewed and findings confirmed"
}
```

### **2. Mark Report as Critical**
```http
PUT /api/reports/507f1f77bcf86cd799439016/critical
Authorization: Bearer <token>
Content-Type: application/json

{
  "criticalValues": [
    {
      "parameter": "hemoglobin",
      "value": "8.5",
      "normalRange": "12.0-15.5",
      "unit": "g/dL"
    }
  ]
}
```

---

## 📁 **File Operations**

### **1. Upload Report File**
```http
POST /api/reports/507f1f77bcf86cd799439016/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: [PDF/Image file]
```

### **2. Download Report File**
```http
GET /api/reports/507f1f77bcf86cd799439016/download
Authorization: Bearer <token>
```

---

## 📋 **Reference Data**

### **1. Get Report Types**
```http
GET /api/reports/types
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": [
    "blood_test",
    "urine_test",
    "x_ray",
    "mri_scan",
    "ct_scan",
    "ecg",
    "ultrasound",
    "biopsy",
    "pathology",
    "radiology",
    "cardiology",
    "neurology",
    "pulmonology",
    "endocrinology",
    "general_lab",
    "other"
  ]
}
```

### **2. Get Report Statuses**
```http
GET /api/reports/statuses
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": [
    "pending",
    "in_progress",
    "completed",
    "reviewed",
    "archived"
  ]
}
```

### **3. Get Access Levels**
```http
GET /api/reports/access-levels
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ok": true,
  "data": [
    "private",
    "patient",
    "doctor",
    "hospital",
    "public"
  ]
}
```

---

## 🔐 **Access Control & Permissions**

### **Role-Based Access**

| Role | Can Create | Can Read | Can Update | Can Delete | Can Review |
|------|------------|----------|------------|------------|------------|
| **Patient** | ❌ | Own reports only | Limited fields | ❌ | ❌ |
| **Doctor** | ✅ | Own + assigned reports | Own reports | ❌ | ✅ |
| **Hospital** | ❌ | Hospital reports | ❌ | ❌ | ❌ |
| **Admin** | ✅ | All reports | All reports | ✅ | ✅ |

### **Access Level Control**

- **private**: Only creator and admin
- **patient**: Patient can access
- **doctor**: Doctors can access
- **hospital**: Hospital staff can access
- **public**: Anyone with authentication

---

## 🏥 **Report Types & Data Structure**

### **Blood Test Report**
```json
{
  "reportType": "blood_test",
  "title": "Complete Blood Count",
  "reportData": {
    "hemoglobin": "14.2 g/dL",
    "white_blood_cells": "7.5 K/μL",
    "platelets": "250 K/μL",
    "red_blood_cells": "4.8 M/μL"
  },
  "results": {
    "hemoglobin": {
      "value": "14.2",
      "unit": "g/dL",
      "normal_range": "12.0-15.5",
      "status": "normal"
    }
  }
}
```

### **X-Ray Report**
```json
{
  "reportType": "x_ray",
  "title": "Chest X-Ray",
  "reportData": {
    "view": "PA and Lateral",
    "technique": "Standard chest radiography"
  },
  "results": {
    "lungs": "Clear",
    "heart": "Normal size and shape",
    "bones": "No fractures"
  }
}
```

### **MRI Scan Report**
```json
{
  "reportType": "mri_scan",
  "title": "Brain MRI",
  "reportData": {
    "sequences": ["T1", "T2", "FLAIR"],
    "contrast": "Gadolinium"
  },
  "results": {
    "brain_parenchyma": "Normal",
    "ventricles": "Normal size",
    "white_matter": "No lesions"
  }
}
```

---

## 🔗 **Blockchain Integration**

### **Blockchain Mode**
When `BLOCKCHAIN_MODE` is enabled, reports are also stored on the blockchain:

1. **Report Creation**: Hash is generated and stored on blockchain
2. **Report Update**: Updated hash is stored on blockchain
3. **Report Deletion**: Report hash is removed from blockchain

### **Blockchain Fields**
- `blockchainHash`: SHA256 hash of report data
- `blockchainTxHash`: Transaction hash from blockchain

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Doctor Creates Report**
1. Doctor logs in
2. Creates blood test report for patient
3. Verifies report is created with correct permissions
4. Checks blockchain integration (if enabled)

### **Scenario 2: Patient Views Reports**
1. Patient logs in
2. Views their own reports
3. Verifies cannot access other patients' reports
4. Checks report data integrity

### **Scenario 3: Critical Report Alert**
1. Doctor marks report as critical
2. System flags critical values
3. Hospital can view critical reports
4. Patient is notified of critical findings

### **Scenario 4: Report Workflow**
1. Create report (pending)
2. Update with results (in_progress)
3. Mark as reviewed (reviewed)
4. Archive old reports (archived)

---

## 🚀 **Best Practices**

### **Report Creation**
1. **Validate Data**: Ensure all required fields are provided
2. **Normal Ranges**: Include normal ranges for test results
3. **Critical Values**: Flag critical values appropriately
4. **Access Control**: Set appropriate access levels
5. **Tags**: Use tags for better categorization

### **Security**
1. **Authentication**: Always require valid JWT tokens
2. **Authorization**: Check role-based permissions
3. **Data Privacy**: Respect patient privacy settings
4. **Audit Trail**: Track all report changes
5. **Blockchain**: Use blockchain for data integrity

### **Performance**
1. **Indexing**: Use database indexes for common queries
2. **Pagination**: Implement pagination for large datasets
3. **Caching**: Cache frequently accessed reports
4. **File Storage**: Use efficient file storage solutions

---

## 📚 **Error Handling**

### **Common Error Responses**

**400 Bad Request**
```json
{
  "ok": false,
  "message": "Patient ID, Doctor ID, Hospital ID, Report Type, Title, and Test Date are required"
}
```

**401 Unauthorized**
```json
{
  "ok": false,
  "message": "Access denied"
}
```

**404 Not Found**
```json
{
  "ok": false,
  "message": "Report not found"
}
```

**500 Internal Server Error**
```json
{
  "ok": false,
  "message": "Internal server error"
}
```

---

## 🎯 **Integration Examples**

### **Frontend Integration**
```javascript
// Create report
const createReport = async (reportData) => {
  const response = await fetch('/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reportData)
  });
  return response.json();
};

// Get patient reports
const getPatientReports = async (patientId) => {
  const response = await fetch(`/api/reports/patient/${patientId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### **Mobile App Integration**
```javascript
// Search reports
const searchReports = async (query) => {
  const response = await fetch(`/api/reports/search?q=${query}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## 🎉 **Summary**

The Medical Reports API provides:

✅ **Complete CRUD Operations** for medical reports
✅ **Role-Based Access Control** with proper permissions
✅ **Advanced Filtering & Search** capabilities
✅ **Report Workflow Management** (pending → completed → reviewed)
✅ **Critical Value Alerts** for urgent findings
✅ **Blockchain Integration** for data integrity
✅ **File Upload/Download** support
✅ **Comprehensive Statistics** and analytics
✅ **Multi-format Support** (blood tests, X-rays, MRI, etc.)
✅ **Audit Trail** for all changes

The system ensures data security, privacy, and integrity while providing comprehensive medical report management capabilities for healthcare professionals and patients.

Happy Report Management! 📋🏥✨
