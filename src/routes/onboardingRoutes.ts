import { Router } from 'express';
import { OnboardingController } from '../controllers/onboardingController';

const router = Router();

// Validar token de invitación
router.get('/validate-token', async (req, res) => {
  await OnboardingController.validateInvitationToken(req, res);
});

// Configurar acceso del cliente
router.post('/setup-access', async (req, res) => {
  await OnboardingController.setupClientAccess(req, res);
});

// Reenviar invitación (requiere autenticación de operador)
router.post('/resend-invitation/:companyId', async (req, res) => {
  await OnboardingController.resendInvitation(req, res);
});

export default router;