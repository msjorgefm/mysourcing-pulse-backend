import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { updateProfileValidation, changePasswordValidation } from '../validations/userValidation';

const router = Router();

// Middleware de validación personalizado
const validateUpdateProfile = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = updateProfileValidation.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      error: error.details[0].message
    });
    return;
  }
  next();
};

const validateChangePassword = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = changePasswordValidation.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      error: error.details[0].message
    });
    return;
  }
  next();
};

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener perfil del usuario actual
router.get('/profile', async (req: Request, res: Response) => {
  await UserController.getCurrentUserProfile(req, res);
});

// Actualizar perfil del usuario actual
router.put('/profile', validateUpdateProfile, async (req: Request, res: Response) => {
  await UserController.updateProfile(req, res);
});

// Cambiar contraseña
router.put('/change-password', validateChangePassword, async (req: Request, res: Response) => {
  await UserController.changePassword(req, res);
});

export default router;