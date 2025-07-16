import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { companyMappingController } from '../controllers/companyMappingController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Guardar configuración de mapeo
router.post('/:companyId', companyMappingController.saveMapping);

// Obtener configuración de mapeo
router.get('/:companyId', companyMappingController.getMapping);

// Procesar Excel con mapeo
router.post('/:companyId/process', companyMappingController.processExcel);

export default router;