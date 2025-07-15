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
  
  static async validateSetupToken(req: Request, res: Response) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ error: 'Token requerido' });
      }
      
      // Primero intentar con el setupToken de User
      try {
        const user = await AuthService.validateSetupToken(token);
        res.json({
          message: 'Token válido',
          data: {
            email: user.email,
            name: user.username
          }
        });
        return;
      } catch (userTokenError) {
        // Si no se encuentra en User, buscar en InvitationToken
        console.log('Token no encontrado en User, buscando en InvitationToken...');
      }
      
      // Buscar en InvitationToken
      const { InvitationService } = await import('../services/invitationService');
      const invitationDetails = await InvitationService.getInvitationDetails(token);
      
      if (invitationDetails) {
        res.json({
          message: 'Token válido',
          data: {
            email: invitationDetails.email,
            name: invitationDetails.company.name
          }
        });
      } else {
        throw new Error('Token inválido o expirado');
      }
    } catch (error: any) {
      console.error('Error validating setup token:', error);
      res.status(400).json({ error: error.message || 'Token inválido o expirado' });
    }
  }
  
  static async completeAccountSetup(req: Request, res: Response) {
    try {
      const { token, username, password, confirmPassword } = req.body;
      
      // Validaciones básicas
      if (!token || !username || !password || !confirmPassword) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
      }
      
      // Primero intentar con el setupToken de User
      try {
        const result = await AuthService.completeAccountSetup(token, username, password);
        res.json({
          message: 'Cuenta configurada exitosamente',
          data: result
        });
        return;
      } catch (userTokenError) {
        // Si no se encuentra en User, manejar con InvitationToken
        console.log('Token no encontrado en User, procesando como InvitationToken...');
      }
      
      // Manejar InvitationToken (para empresas nuevas)
      const { InvitationService } = await import('../services/invitationService');
      const { UserService } = await import('../services/userService');
      const bcrypt = await import('bcrypt');
      
      // Validar token de invitación
      const invitationDetails = await InvitationService.getInvitationDetails(token);
      if (!invitationDetails) {
        throw new Error('Token inválido o expirado');
      }
      
      // Verificar que no exista un usuario con ese email
      const existingUser = await UserService.getUserByEmail(username);
      if (existingUser) {
        throw new Error('El nombre de usuario ya está en uso');
      }
      
      // Crear el usuario
      const hashedPassword = await bcrypt.hash(password, 10);
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const newUser = await prisma.user.create({
        data: {
          email: username,
          password: hashedPassword,
          username: invitationDetails.company.name,
          role: 'CLIENT',
          companyId: invitationDetails.company.id
        }
      });
      
      // Marcar el token como usado
      await InvitationService.markTokenAsUsed(token);
      
      // Generar tokens de autenticación
      const result = await AuthService.login({ email: username, password });
      
      res.json({
        message: 'Cuenta configurada exitosamente',
        data: result
      });
    } catch (error: any) {
      console.error('Error completing account setup:', error);
      res.status(400).json({ error: error.message || 'Error al configurar la cuenta' });
    }
  }
}
