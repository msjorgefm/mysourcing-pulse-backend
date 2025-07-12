import express from 'express';
import { CompanyController } from '../controllers/companyController';
import { authenticate, authorize } from '../middleware/auth';
import { CompanyWizardController } from '../controllers/companyWizardController';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas para empresas
router.get('/', async (req, res, next) => {
  try {
    await CompanyController.getAllCompanies(req, res);
  } catch (err) {
    next(err);
  }
});
router.get('/:id', async (req, res, next) => {
  try {
    await CompanyController.getCompanyById(req, res);
  } catch (err) {
    next(err);
  }
});
router.get('/:id/stats', async (req, res, next) => {
  try {
    await CompanyController.getCompanyStats(req, res);
  } catch (err) {
    next(err);
  }
});
// Solo operadores pueden crear, actualizar y eliminar empresas
router.post('/', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyController.createCompany(req, res);
  } catch (err) {
    next(err);
  }
});
router.put('/:id', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyController.updateCompany(req, res);
  } catch (err) {
    next(err);
  }
});
router.delete('/:id', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyController.deleteCompany(req, res);
  } catch (err) {
    next(err);
  }
});

// Rutas del wizard de configuración
router.get('/:companyId/wizard/status', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyWizardController.getWizardStatus(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/:companyId/wizard/section/:sectionNumber/data', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyWizardController.getSectionData(req, res);
  } catch (err) {
    next(err);
  }
});

router.put('/:companyId/wizard/section/:sectionNumber/step/:stepNumber', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyWizardController.updateWizardStep(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/:companyId/wizard/complete', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyWizardController.completeWizard(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener departamentos de una empresa
router.get('/:companyId/departments', authenticate, async (req, res) => {
  try {
    const { companyId } = req.params;
    const departments = await CompanyController.getCompanyDepartments(parseInt(companyId));
    res.json(departments);
  } catch (error) {
    console.error('Error getting departments:', error);
    res.status(500).json({ error: 'Error al obtener los departamentos' });
  }
});

// Crear invitación para jefe de departamento
router.post('/:companyId/invite-department-head', authenticate, async (req, res) => {
  try {
    const { companyId } = req.params;
    const { email, departmentId } = req.body;
    
    // Verificar que el usuario tenga permisos
    const userId = (req as any).user?.id;
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { company: true }
      });
      
      console.log('Permission check debug:', {
        userId,
        userFound: !!user,
        userCompanyId: user?.companyId,
        requestedCompanyId: parseInt(companyId),
        userRole: user?.role,
        companyMatch: user?.companyId === parseInt(companyId),
        isOperator: user?.role === 'OPERATOR'
      });
      
      // Allow OPERATOR users (system admins) or users who are OPERATOR for the specific company
      if (!user || (user.role !== 'OPERATOR' && user.role !== 'ADMIN')) {
        res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
        return;
      }
      
      // If user has a companyId, it must match the requested company
      if (user.companyId && user.companyId !== parseInt(companyId)) {
        res.status(403).json({ error: 'No tienes permisos para realizar esta acción en esta empresa' });
        return;
      }
      
      const result = await CompanyController.inviteDepartmentHead(parseInt(companyId), email, departmentId);
      res.json(result);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Error inviting department head:', error);
    res.status(500).json({ error: 'Error al enviar la invitación' });
  }
});

// Resend invitation to company
router.post('/:id/resend-invitation', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyController.resendInvitation(req, res);
  } catch (err) {
    next(err);
  }
});

// Send additional invitation to company
router.post('/:id/send-additional-invitation', authorize(['OPERATOR', 'ADMIN']), async (req, res, next) => {
  try {
    await CompanyController.sendAdditionalInvitation(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;