import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getUserByWallet,
  verifyToken,
  handlePatientMessage,
  reportAnalyseData,
  getChatHistory,
  deleteProfile
} from '../controllers/auth.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const r = Router();

// Public routes (no authentication required)
r.post('/register', register);
r.post('/login', login);
r.post('/forgot-password', forgotPassword);
r.post('/reset-password', resetPassword);
r.post('/verify-token', verifyToken);

// Protected routes (authentication required)
r.get('/profile', authenticateToken, getProfile);
r.put('/profile', authenticateToken, updateProfile);
r.delete('/profile', authenticateToken, deleteProfile);
r.post('/change-password', authenticateToken, changePassword);
r.post('/refresh-token', authenticateToken, refreshToken);
r.post('/logout', authenticateToken, logout);

r.post('/chat', authenticateToken, handlePatientMessage);
r.get('/chat-history/:patientId', authenticateToken, getChatHistory);
r.post('/analyse-report', authenticateToken, reportAnalyseData);

// Admin routes
r.get('/user/wallet/:walletAddress', authenticateToken, requireRole('admin'), getUserByWallet);

export default r;
