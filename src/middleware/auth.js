import { AuthService } from '../services/auth.service.js';

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = AuthService.verifyToken(token);
    
    // Get current user
    const user = await AuthService.getCurrentUser(decoded.id);
    console.log("User--------->", user)
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'Invalid or expired token'
    });
  }
};

// Middleware to check if user has specific role
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: 'Authentication required'
      });
    }

    // Convert roles to array if it's a string
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Middleware to check if user is the owner of the resource
export const requireOwnership = (entityType) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: 'Authentication required'
      });
    }

    const resourceId = req.params.id || req.body.entityId;
    
    // Allow if user is admin
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    if (req.user.entityId.toString() === resourceId) {
      return next();
    }

    return res.status(403).json({
      ok: false,
      message: 'Access denied: You can only access your own resources'
    });
  };
};

// Middleware to check if user can access patient data (for doctors/hospitals)
export const canAccessPatientData = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: 'Authentication required'
      });
    }

    // Allow if user is admin
    if (req.user.role === 'admin') {
      return next();
    }

    // Allow if user is the patient
    if (req.user.role === 'patient') {
      return next();
    }

    // For doctors and hospitals, check if they have consent
    const patientId = req.params.patientId || req.body.patientId;
    if (!patientId) {
      return res.status(400).json({
        ok: false,
        message: 'Patient ID required'
      });
    }

    // Import consent service here to avoid circular dependency
    const { ConsentService } = await import('../services/consent.service.js');
    
    // Check if consent exists
    const hasConsent = await ConsentService.checkConsent(
      patientId,
      req.user.walletAddress,
      'medical_records'
    );

    if (!hasConsent) {
      return res.status(403).json({
        ok: false,
        message: 'Access denied: No consent to access patient data'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error checking access permissions'
    });
  }
};

// Middleware to validate wallet signature (for blockchain operations)
export const validateWalletSignature = (req, res, next) => {
  const signature = req.headers['x-wallet-signature'];
  const message = req.headers['x-wallet-message'];
  const walletAddress = req.headers['x-wallet-address'];

  if (!signature || !message || !walletAddress) {
    return res.status(400).json({
      ok: false,
      message: 'Wallet signature, message, and address required'
    });
  }

  // In a real implementation, you would verify the signature here
  // For now, we'll just check if the wallet address matches the user's
  if (req.user && req.user.walletAddress !== walletAddress) {
    return res.status(403).json({
      ok: false,
      message: 'Wallet address mismatch'
    });
  }

  next();
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = AuthService.verifyToken(token);
      const user = await AuthService.getCurrentUser(decoded.id);
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
