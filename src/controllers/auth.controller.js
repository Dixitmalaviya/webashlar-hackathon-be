import { AuthService } from '../services/auth.service.js';
import { sha256OfObject } from '../utils/hash.js';

// Register new user
export const register = async (req, res, next) => {
  try {
    // const { email, password, walletAddress, role, ...entityData } = req.body;
    const { email, password, walletAddress, role, ...rest } = req.body;
    const entityData = { ...rest, email };
    const blockchainHash = sha256OfObject({ ...req.body });


    // Validate required fields
    if (!email || !password || !walletAddress || !role) {
      return res.status(400).json({
        ok: false,
        message: 'Email, password, wallet address, and role are required'
      });
    }

    // Validate role
    const validRoles = ['patient', 'doctor', 'hospital'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        ok: false,
        message: 'Invalid role. Must be one of: patient, doctor, hospital'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const result = await AuthService.register(
      { email, password, walletAddress },
      entityData,
      role,
      blockchainHash
    );

    res.status(201).json({
      ok: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Email and password are required'
      });
    }

    const result = await AuthService.login(email, password);

    res.json({
      ok: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await AuthService.getCurrentUser(req.user.id);

    res.json({
      ok: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await AuthService.updateProfile(req.user.id, { email });

    res.json({
      ok: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        ok: false,
        message: 'Current password and new password are required'
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    await AuthService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({
      ok: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        ok: false,
        message: 'Email is required'
      });
    }

    const result = await AuthService.forgotPassword(email);

    res.json({
      ok: true,
      message: 'Password reset instructions sent to email',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        ok: false,
        message: 'Token and new password are required'
      });
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    await AuthService.resetPassword(token, newPassword);

    res.json({
      ok: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const result = await AuthService.refreshToken(req.user.id);

    res.json({
      ok: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    await AuthService.logout(req.user.id);

    res.json({
      ok: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user by wallet address
export const getUserByWallet = async (req, res, next) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({
        ok: false,
        message: 'Wallet address is required'
      });
    }

    const user = await AuthService.getUserByWallet(walletAddress);

    res.json({
      ok: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Verify token (for client-side token validation)
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: 'Token is required'
      });
    }

    const decoded = AuthService.verifyToken(token);
    const user = await AuthService.getCurrentUser(decoded.id);

    res.json({
      ok: true,
      data: {
        valid: true,
        user
      }
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
      message: 'Invalid or expired token',
      data: {
        valid: false
      }
    });
  }
};
