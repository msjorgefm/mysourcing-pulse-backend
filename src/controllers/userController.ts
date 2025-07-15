import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import bcrypt from 'bcryptjs';

export class UserController {
  
  // Obtener perfil del usuario actual
  static async getCurrentUserProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      
      const user = await UserService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }
      
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          phone: user.phone,
          photoUrl: user.photoUrl,
          role: user.role,
          companyId: user.companyId,
          companyName: user.company?.name
        }
      });
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener el perfil'
      });
    }
  }
  
  // Actualizar perfil del usuario
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { username, phone } = req.body;
      
      const updatedUser = await UserService.updateUser(userId, {
        username,
        phone
      });
      
      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          phone: updatedUser.phone,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar el perfil'
      });
    }
  }

  // Actualizar datos básicos del usuario (para empleados)
  static async updateUserData(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { username, email } = req.body;
      
      // Obtener el usuario para verificar si es empleado
      const user = await UserService.getUserById(parseInt(id));
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }
      
      // Si el usuario es un empleado, solo actualizar el email/username
      // Los datos personales (firstName, lastName) deben manejarse desde Employee/WorkerDetails
      const updateData: any = {};
      
      if (user.role === 'EMPLOYEE' && user.workerDetailsId) {
        // Para empleados, solo actualizar email/username
        if (email) updateData.email = email;
        if (username) updateData.username = username;
      } else {
        // Para otros roles (CLIENT, DEPARTMENT_HEAD, etc.), actualizar todos los campos
        if (username) updateData.username = username;
        if (email) updateData.email = email;
      }
      
      const updatedUser = await UserService.updateUser(parseInt(id), updateData);
      
      res.json({
        success: true,
        message: 'Datos de usuario actualizados exitosamente',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Error updating user data:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar los datos de usuario'
      });
    }
  }
  
  // Cambiar contraseña
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { currentPassword, newPassword } = req.body;
      
      // Obtener usuario actual con contraseña para verificación
      const user = await UserService.getUserByIdWithPassword(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }
      
      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'La contraseña actual es incorrecta'
        });
      }
      
      // Actualizar contraseña
      await UserService.updateUser(userId, {
        password: newPassword // El servicio se encarga de hashearla
      });
      
      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cambiar la contraseña'
      });
    }
  }

  // Cambiar contraseña por ID de usuario específico
  static async changePasswordById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      
      // Obtener usuario con contraseña para verificación
      const user = await UserService.getUserByIdWithPassword(parseInt(id));
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }
      
      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'La contraseña actual es incorrecta'
        });
      }
      
      // Actualizar contraseña
      await UserService.updateUser(parseInt(id), {
        password: newPassword // El servicio se encarga de hashearla
      });
      
      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        error: 'Error al cambiar la contraseña'
      });
    }
  }
  
}