import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { loginValidation, registerValidation } from '../validations/authValidation';

export class AuthController {
  
  static async login(req: Request, res: Response) {
    try {
      console.log('🔵 Login request received:', req.body.email);
      console.log('🔵 Request headers:', req.headers);
      
      const { error } = loginValidation.validate(req.body);
      if (error) {
        console.log('❌ Validation error:', error.details[0].message);
        return res.status(400).json({ error: error.details[0].message });
      }
      
      const result = await AuthService.login(req.body);
      
      console.log('✅ Login response ready for:', req.body.email);
      
      res.json({
        message: 'Login successful',
        data: result
      });
    } catch (error: any) {
      console.error('❌ Login controller error:', error);
      res.status(401).json({ error: error.message || 'Login failed' });
    }
  }
  
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }
      
      const result = await AuthService.refreshToken(refreshToken);
      
      res.json({
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      res.status(401).json({ error: error.message || 'Token refresh failed' });
    }
  }
  
  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      
      res.json({ message: 'Logout successful' });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }
  
  static async register(req: Request, res: Response) {
    try {
      const { error } = registerValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      
      const user = await AuthService.createUser(req.body);
      
      res.status(201).json({
        message: 'User created successfully',
        data: user
      });
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  }
  
  static async getProfile(req: any, res: Response) {
    try {
      res.json({
        message: 'Profile retrieved successfully',
        data: req.user
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  }
}
