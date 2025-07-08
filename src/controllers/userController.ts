import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import bcrypt from 'bcrypt';

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
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
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
      const { firstName, lastName, phone } = req.body;
      
      // Actualizar el nombre completo
      const fullName = `${firstName} ${lastName}`;
      
      const updatedUser = await UserService.updateUser(userId, {
        firstName,
        lastName,
        phone,
        name: fullName
      });
      
      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
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
}