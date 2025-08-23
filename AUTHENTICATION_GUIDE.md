# Authentication System Guide

This guide covers the complete authentication system for the Healthcare Chain API, including user registration, login, JWT tokens, and security features.

## 🏗️ Architecture Overview

The authentication system consists of:

- **User Model**: Stores user credentials and profile information
- **Auth Service**: Handles authentication logic and JWT operations
- **Auth Controller**: API endpoints for authentication
- **Auth Middleware**: Route protection and authorization
- **JWT Tokens**: Stateless authentication mechanism

## 🔐 Security Features

### Password Security
- **bcryptjs**: Password hashing with salt rounds (12)
- **Minimum Length**: 6 characters required
- **Automatic Hashing**: Passwords are hashed before saving

### Account Protection
- **Login Attempts**: Tracks failed login attempts
- **Account Locking**: Locks account after 5 failed attempts for 2 hours
- **Automatic Reset**: Login attempts reset on successful login

### JWT Security
- **Secret Key**: Configurable via `JWT_SECRET` environment variable
- **Expiration**: Configurable via `JWT_EXPIRES_IN` (default: 24h)
- **Token Verification**: Server-side token validation

## 📋 User Roles

The system supports multiple user roles:

- **`patient`**: Healthcare patients
- **`doctor`**: Medical professionals
- **`hospital`**: Healthcare institutions
- **`admin`**: System administrators

## 🔄 Authentication Flow

### 1. Registration Flow
```
User Data + Entity Data → Validation → Create Entity → Create User → Generate JWT → Return Token
```

### 2. Login Flow
```
Email + Password → Validate Credentials → Check Account Status → Generate JWT → Return Token
```

### 3. Protected Route Flow
```
Request + JWT Token → Verify Token → Check User → Add to Request → Continue
```

## 🛠️ API Endpoints

### Public Endpoints (No Authentication Required)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "walletAddress": "0x...",
  "role": "patient",
  // ... entity-specific fields
}
```

**Response:**
```json
{
  "ok": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "role": "patient",
      "walletAddress": "0x...",
      "entityId": "507f1f77bcf86cd799439012",
      "entityDetails": { ... }
    },
    "expiresIn": "24h"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... },
    "expiresIn": "24h"
  }
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Password reset instructions sent to email",
  "data": {
    "resetToken": "abc123...",
    "expiresIn": "1 hour"
  }
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "newPassword": "newpassword123"
}
```

#### Verify Token
```http
POST /api/auth/verify-token
Authorization: Bearer <token>
```

### Protected Endpoints (Authentication Required)

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh-token
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

## 🔧 Middleware Usage

### Basic Authentication
```javascript
import { authenticateToken } from '../middleware/auth.js';

// Protect a route
app.get('/protected', authenticateToken, (req, res) => {
  // req.user contains the authenticated user
  res.json({ user: req.user });
});
```

### Role-Based Access
```javascript
import { requireRole } from '../middleware/auth.js';

// Require specific role
app.get('/admin-only', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

// Require multiple roles
app.get('/medical-staff', authenticateToken, requireRole(['doctor', 'hospital']), (req, res) => {
  res.json({ message: 'Medical staff access granted' });
});
```

### Resource Ownership
```javascript
import { requireOwnership } from '../middleware/auth.js';

// Ensure user owns the resource
app.get('/my-records/:id', authenticateToken, requireOwnership('record'), (req, res) => {
  res.json({ message: 'Access granted to own resource' });
});
```

### Patient Data Access
```javascript
import { canAccessPatientData } from '../middleware/auth.js';

// Check if user can access patient data
app.get('/patient/:patientId/records', authenticateToken, canAccessPatientData, (req, res) => {
  res.json({ message: 'Patient data access granted' });
});
```

## 🗄️ Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['patient', 'doctor', 'hospital', 'admin']),
  entityId: ObjectId (reference to entity),
  entityModel: String (enum: ['Patient', 'Doctor', 'Hospital']),
  walletAddress: String (unique, required),
  isActive: Boolean (default: true),
  lastLogin: Date,
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  twoFactorSecret: String,
  twoFactorEnabled: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Best Practices

### Environment Variables
```bash
# Required
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Optional
MONGODB_URI=mongodb://localhost:27017/healthcare
```

### Token Management
- **Store Securely**: Store tokens in secure HTTP-only cookies or secure storage
- **Refresh Regularly**: Use refresh tokens for long-term sessions
- **Validate Server-Side**: Always validate tokens on the server
- **Short Expiry**: Use short-lived access tokens (24h or less)

### Password Security
- **Strong Passwords**: Enforce minimum 6 characters
- **No Plain Text**: Never store passwords in plain text
- **Rate Limiting**: Implement rate limiting for login attempts
- **Account Locking**: Lock accounts after multiple failed attempts

### API Security
- **HTTPS Only**: Use HTTPS in production
- **CORS Configuration**: Configure CORS properly
- **Input Validation**: Validate all input data
- **Error Handling**: Don't expose sensitive information in errors

## 🧪 Testing

### Test Scenarios

1. **Registration Tests**
   - Valid registration with all required fields
   - Duplicate email/wallet address
   - Invalid role
   - Weak password

2. **Login Tests**
   - Valid credentials
   - Invalid credentials
   - Account locked
   - Account deactivated

3. **Token Tests**
   - Valid token access
   - Expired token
   - Invalid token
   - Missing token

4. **Authorization Tests**
   - Role-based access control
   - Resource ownership
   - Patient data access permissions

### Example Test Data
```json
{
  "patient": {
    "email": "john.doe@example.com",
    "password": "password123",
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "role": "patient",
    "fullName": "John Doe",
    "dob": "1990-01-01",
    "phone": "+1234567890",
    "address": "123 Main St, City, State 12345"
  },
  "doctor": {
    "email": "dr.sarah@hospital.com",
    "password": "password123",
    "walletAddress": "0x0987654321098765432109876543210987654321",
    "role": "doctor",
    "fullName": "Dr. Sarah Smith",
    "licenseNumber": "MD123456",
    "phone": "+1234567892",
    "specialization": "Cardiology",
    "yearsOfExperience": 10
  }
}
```

## 🚀 Integration with Blockchain

### Wallet Integration
- **Wallet Address**: Required for all users
- **Signature Verification**: Optional for blockchain operations
- **Consent Management**: Uses wallet addresses for consent tracking

### Blockchain Modes
- **Enabled**: Full blockchain integration with JWT authentication
- **Disabled**: Database-only with JWT authentication
- **Hybrid**: Blockchain with database fallback

## 📝 Error Handling

### Common Error Responses

#### Authentication Errors
```json
{
  "ok": false,
  "message": "Invalid email or password"
}
```

#### Authorization Errors
```json
{
  "ok": false,
  "message": "Insufficient permissions"
}
```

#### Validation Errors
```json
{
  "ok": false,
  "message": "Email, password, wallet address, and role are required"
}
```

#### Token Errors
```json
{
  "ok": false,
  "message": "Invalid or expired token"
}
```

## 🔄 Migration Guide

### From No Authentication
1. Add authentication middleware to existing routes
2. Update client applications to include JWT tokens
3. Test all endpoints with authentication

### From Basic Authentication
1. Replace basic auth with JWT tokens
2. Update user model to include new fields
3. Migrate existing user data

## 📚 Additional Resources

- [JWT.io](https://jwt.io/) - JWT token debugger
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js/) - Password hashing
- [MongoDB Authentication](https://docs.mongodb.com/manual/core/authentication/) - Database security
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practices-security.html)

---

## 🎯 Quick Start Checklist

- [ ] Set up environment variables
- [ ] Install dependencies (`bcryptjs`, `jsonwebtoken`)
- [ ] Import authentication routes in main app
- [ ] Test registration endpoint
- [ ] Test login endpoint
- [ ] Test protected routes
- [ ] Configure CORS and security headers
- [ ] Set up error handling
- [ ] Test password reset flow
- [ ] Verify JWT token validation

Happy Authenticating! 🔐
