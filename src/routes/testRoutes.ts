import { Router } from 'express';
import { TestController } from '../controllers/testController';

const router = Router();

// Solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  // Generar invitación de prueba
  router.post('/invitation', async (req, res) => {
    await TestController.testInvitation(req, res);
  });
}

export default router;