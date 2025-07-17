import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { loginValidation, registerValidation } from '../validations/authValidation';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { InvitationService } from '../services/invitationService';
import { UserService } from '../services/userService';
import { emailService } from '../services/emailService';

const prisma = new PrismaClient();

export class AuthController {
  
  static async login(req: Request, res: Response) {
    try {
      console.log('🔵 Login request received:', req.body.email);
      console.log('🔵 Request headers:', req.headers);
      
      const { error } = loginValidation.validate(req.body);
      if (error) {
        console.log('❌ Validation error:', error.details[0].message);
        return res.status(400).json({ success: false, error: error.details[0].message });
      }
      
      const result = await AuthService.login(req.body);
      
      console.log('✅ Login response ready for:', req.body.email);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error: any) {
      console.error('❌ Login controller error:', error);
      res.status(401).json({ success: false, error: error.message || 'Login failed' });
    }
  }
  
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ success: false, error: 'Refresh token required' });
      }
      
      const result = await AuthService.refreshToken(refreshToken);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Refresh token error:', error);
      res.status(401).json({ success: false, error: error.message || 'Token refresh failed' });
    }
  }
  
  static async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      
      res.json({ success: true, message: 'Logout successful' });
    } catch (error: any) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, error: 'Logout failed' });
    }
  }
  
  static async register(req: Request, res: Response) {
    try {
      const { error } = registerValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ success: false, error: error.details[0].message });
      }
      
      const user = await AuthService.createUser(req.body);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error: any) {
      console.error('Register error:', error);
      if (error.code === 'P2002') {
        return res.status(409).json({ success: false, error: 'Email already exists' });
      }
      res.status(500).json({ success: false, error: error.message || 'Registration failed' });
    }
  }
  
  static async getProfile(req: any, res: Response) {
    try {
      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: req.user
      });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({ success: false, error: 'Failed to get profile' });
    }
  }
  
  static async validateSetupToken(req: Request, res: Response) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({ success: false, error: 'Token requerido' });
      }

      let user;
      // Primero intentar con el setupToken de User
      try {
        user = await AuthService.validateSetupToken(token);
        
        // Si el usuario tiene workerDetails, obtener información adicional
        
        const userWithDetails = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            workerDetails: true,
            company: true
          }
        });
        const responseData: any = {
          email: user.email,
          company: userWithDetails?.company,
          metadata: {
            role: user.role
          }
        };
        // Si es un empleado o jefe de departamento, incluir su información
        if (userWithDetails?.workerDetails && (user.role === 'EMPLOYEE' || user.role === 'DEPARTMENT_HEAD')) {
          responseData.metadata.name = `${userWithDetails.workerDetails.nombres} ${userWithDetails.workerDetails.apellidoPaterno} ${userWithDetails.workerDetails.apellidoMaterno || ''}`.trim();
        }
        res.json({
          success: true,
          message: 'Token válido',
          data: {
            email: responseData.email,
            company: responseData.company || '',
            metadata: responseData.metadata           
           }
          });
        return;
      } catch (userTokenError) {
        // Si no se encuentra en User, buscar en InvitationToken
        console.log('Token no encontrado en User, buscando en InvitationToken...');
      }
      
      // Buscar en InvitationToken
      const invitationDetails = await InvitationService.getInvitationDetails(token);

      if (invitationDetails) {
        // Si no hay metadata, buscar el usuario por email y companyId para obtener su rol
        let metadata = invitationDetails.metadata;
        
        if (!metadata) {
          const user = await prisma.user.findFirst({
            where: {
              email: invitationDetails.email,
              companyId: invitationDetails.company.id
            }
          });
          
          if (user) {
            metadata = { role: user.role };
          }
        }
        
        res.json({
          success: true,
          message: 'Token válido',
          data: {
            email: invitationDetails.email,
            company: invitationDetails.company.name,
            metadata: metadata
          }
        });
      } else {
        throw new Error('Token inválido o expirado');
      }
    } catch (error: any) {
      console.error('Error validating setup token:', error);
      res.status(400).json({ success: false, error: error.message || 'Token inválido o expirado' });
    }
  }
  
  static async completeAccountSetup(req: Request, res: Response) {
    try {
      const { token, username, password, confirmPassword, firstName, lastName, phone } = req.body;
      
      // Validaciones básicas
      if (!token || !username || !password || !confirmPassword) {
        return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({ success: false, error: 'Las contraseñas no coinciden' });
      }
      
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 8 caracteres' });
      }
      
      // Primero intentar con el setupToken de User (para ADMIN y vinculaciones de jefe)
      try {
        const user = await AuthService.validateSetupToken(token);
        
        // Si es un ADMIN, necesitamos actualizar también los datos personales
        if (user.role === 'ADMIN') {
          // Para ADMIN, firstName y lastName son requeridos
          if (!firstName || !lastName) {
            return res.status(400).json({ 
              success: false, 
              error: 'Nombre y apellido son requeridos para administradores' 
            });
          }
          
          const hashedPassword = await bcrypt.hash(password, 12);
          
          // Actualizar el usuario ADMIN con todos los datos (excepto email que ya está configurado)
          const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
              password: hashedPassword,
              username:  username,
              firstName: firstName,
              lastName: lastName,
              phone: phone || null,
              isActive: true,
              setupToken: null,
              setupTokenExpiry: null,
              lastLoginAt: new Date()
            }
          });
          
          // Generar tokens usando el email existente del usuario
          const result = await AuthService.login({ email: user.email, password });
          
          res.json({
            success: true,
            message: 'Cuenta de administrador configurada exitosamente',
            data: result
          });
          return;
        } else {
          // Para otros casos con setupToken (vinculaciones de jefe, etc.)
          const result = await AuthService.completeAccountSetup(token, username, password);
          res.json({
            success: true,
            message: 'Cuenta configurada exitosamente',
            data: result
          });
          return;
        }
      } catch (userTokenError) {
        // Si no se encuentra en User, manejar con InvitationToken
        console.log('Token no encontrado en User, procesando como InvitationToken...');
      }
      
      // Manejar InvitationToken (para empresas nuevas, empleados, etc.)
      
      // Validar token de invitación
      const invitationDetails = await InvitationService.getInvitationDetails(token);
      if (!invitationDetails) {
        throw new Error('Token inválido o expirado');
      }
      
      // Obtener detalles completos de la invitación para verificar metadata
      const fullInvitationDetails = await InvitationService.getFullInvitationDetails(token);
      const metadata = (fullInvitationDetails as any)?.metadata;

      // Determinar el rol basado en la metadata
      let userRole: UserRole = UserRole.CLIENT; // Rol por defecto
      if (metadata?.role === 'DEPARTMENT_HEAD') {
        userRole = UserRole.DEPARTMENT_HEAD;
      } else if (metadata?.role === 'EMPLOYEE') {
        userRole = UserRole.EMPLOYEE;
      }
      
      let newUser: any;
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Si es employee, buscar usuario existente por employeeId y actualizar
      if (metadata?.role === 'EMPLOYEE' && metadata?.workerDetailsId) {
        const existingEmployee = await UserService.getUserByEmployeeId(parseInt(metadata.workerDetailsId.toString()));
        if (existingEmployee) {
          // Verificar si el nuevo username ya está en uso por otro usuario
          const usernameCheck = await UserService.getUserByEmail(username);
          if (usernameCheck && usernameCheck.id !== existingEmployee.id) {
            throw new Error('El nombre de usuario ya está en uso');
          }
          
          // Actualizar usuario existente
          newUser = await prisma.user.update({
            where: { id: existingEmployee.id },
            data: {
              email: username,
              password: hashedPassword,
              isActive: true,
              lastLoginAt: new Date()
            }
          });
        } else {
          // Si no existe el usuario del empleado, crearlo
          newUser = await prisma.user.create({
            data: {
              email: username,
              password: hashedPassword,
              username: metadata.name || username,
              role: userRole,
              companyId: invitationDetails.company.id,
              workerDetailsId: parseInt(metadata.workerDetailsId.toString()),
              isActive: true
            }
          });
        }
      } else {
        // Para otros roles (CLIENT, DEPARTMENT_HEAD), verificar si el username ya existe
        const existingUser = await UserService.getUserByEmail(username);
        if (existingUser) {
          throw new Error('El nombre de usuario ya está en uso');
        }
        
        // Crear usuario con los datos apropiados
        const userData: any = {
          username: username,
          firstName: firstName || null,
          lastName: lastName || null,
          password: hashedPassword,
          role: userRole,
          companyId: invitationDetails.company.id,
          phone: phone || null,
          isActive: true
        };
        
        // Si es DEPARTMENT_HEAD y tiene workerDetailsId en metadata, asociarlo
        if (userRole === UserRole.DEPARTMENT_HEAD && metadata?.workerDetailsId) {
          userData.workerDetailsId = parseInt(metadata.workerDetailsId.toString());
        }

        if(invitationDetails){
          const user = await prisma.user.findFirst({
            where: {
              email: invitationDetails.email,
              companyId: invitationDetails.company.id
            }
          });
          if (user) {
            newUser = await prisma.user.update({where: { id: user.id }, data: userData });
          }else{
            newUser = await prisma.user.create({ data: userData });
          }
        }
        
      }
      
      // Marcar el token como usado
      await InvitationService.markTokenAsUsed(token);
      
      // Generar tokens de autenticación
      const result = await AuthService.login({ email: username, password });
      
      res.json({
        success: true,
        message: 'Cuenta configurada exitosamente',
        data: result
      });
    } catch (error: any) {
      console.error('Error completing account setup:', error);
      res.status(400).json({ success: false, error: error.message || 'Error al configurar la cuenta' });
    }
  }

  static async createAdminInvitation(req: Request, res: Response) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ success: false, error: 'Email es requerido' });
      }
      
      // Verificar que no exista un usuario con ese email
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'Ya existe un usuario con este email' });
      }
      
      // Crear token de setup para el nuevo admin
      const setupToken = crypto.randomBytes(32).toString('hex');
      const setupTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
      
      // Crear usuario con role ADMIN y setupToken
      const newUser = await prisma.user.create({
        data: {
          email,
          password: '', // Se establecerá cuando el admin configure su cuenta
          role: 'ADMIN',
          setupToken,
          setupTokenExpiry,
          isActive: false // Se activará cuando complete el setup
        }
      });
      
      // Enviar email de invitación
      await emailService.sendAdminInvitationEmail(email, setupToken);
      
      res.json({
        success: true,
        message: 'Invitación de administrador enviada exitosamente',
        data: {
          email,
          setupLink: `${process.env.FRONTEND_URL}/setup-account?token=${setupToken}`
        }
      });
    } catch (error: any) {
      console.error('Error creating admin invitation:', error);
      res.status(500).json({ success: false, error: error.message || 'Error al crear invitación de administrador' });
    }
  }
}
