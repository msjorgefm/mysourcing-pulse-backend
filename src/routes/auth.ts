import express from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
	await AuthController.login(req, res);
  } catch (err) {
	next(err);
  }
});
router.post('/refresh', async (req, res, next) => {
  try {
	await AuthController.refreshToken(req, res);
  } catch (err) {
	next(err);
  }
});
router.post('/logout', async (req, res, next) => {
  try {
	await AuthController.logout(req, res);
  } catch (err) {
	next(err);
  }
});
router.post('/register', async (req, res, next) => {
  try {
	await AuthController.register(req, res);
  } catch (err) {
	next(err);
  }
});
router.get('/profile', authenticate as any, async (req, res, next) => {
  try {
    await AuthController.getProfile(req, res);
    // Do not return anything from the handler
    return;
  } catch (err) {
    next(err);
  }
});

// Rutas para configuración de cuenta con token
router.post('/setup-account/validate-token', async (req, res, next) => {
  try {
    await AuthController.validateSetupToken(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/setup-account/complete', async (req, res, next) => {
  try {
    await AuthController.completeAccountSetup(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;