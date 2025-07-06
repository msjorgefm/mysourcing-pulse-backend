import { Request, Response } from 'express';
import { InvitationService } from '../services/invitationService';
import { UserService } from '../services/userService';
import bcrypt from 'bcrypt';
import Joi from 'joi';

export class OnboardingController {
  
  // Validar token de invitación
  static async validateInvitationToken(req: Request, res: Response) {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Token is required'
        });
      }
      
      const invitationDetails = await InvitationService.getInvitationDetails(token);
      
      if (!invitationDetails) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
      
      res.json({
        success: true,
        data: invitationDetails
      });
    } catch (error) {
      console.error('Error validating invitation token:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate token'
      });
    }
  }
  
  // Configurar acceso del cliente
  static async setupClientAccess(req: Request, res: Response) {
    try {
      // Validación del esquema
      const schema = Joi.object({
        token: Joi.string().required(),
        username: Joi.string().min(3).max(50).required(),
        password: Joi.string().min(8).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
      });
      
      const { error, value } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: error.details[0].message
        });
      }
      
      const { token, username, password } = value;
      
      // Validar token
      const validation = await InvitationService.validateToken(token);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired token'
        });
      }
      
      // Verificar si el username ya existe
      const existingUser = await UserService.getUserByEmail(username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        });
      }
      
      // Obtener detalles de la invitación
      const invitationDetails = await InvitationService.getInvitationDetails(token);
      if (!invitationDetails) {
        return res.status(400).json({
          success: false,
          error: 'Invalid token'
        });
      }
      
      // Hashear contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Crear usuario con rol CLIENT
      const newUser = await UserService.createUser({
        email: username,
        password: hashedPassword,
        name: invitationDetails.company.name,
        role: 'CLIENT',
        companyId: invitationDetails.company.id
      });
      
      // Marcar token como usado
      await InvitationService.markTokenAsUsed(token);
      
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          userId: newUser.id,
          username: newUser.email,
          companyName: invitationDetails.company.name
        }
      });
    } catch (error) {
      console.error('Error setting up client access:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create account'
      });
    }
  }
  
  // Reenviar invitación
  static async resendInvitation(req: Request, res: Response) {
    try {
      const { companyId } = req.params;
      
      // Aquí deberías verificar que el usuario que hace la petición es un operador
      // Por ahora lo omitimos para simplificar
      
      const companyIdNum = parseInt(companyId);
      if (isNaN(companyIdNum)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid company ID'
        });
      }
      
      // Obtener información de la empresa
      const company = await UserService.getCompanyById(companyIdNum);
      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Company not found'
        });
      }
      
      // Crear y enviar nueva invitación
      await InvitationService.createAndSendInvitation(
        companyIdNum,
        company.email,
        company.name
      );
      
      res.json({
        success: true,
        message: 'Invitation resent successfully'
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to resend invitation'
      });
    }
  }
}