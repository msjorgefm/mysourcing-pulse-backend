import { Router } from 'express';
import { companyIncidenceTypeController } from '../controllers/companyIncidenceTypeController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener tipos de incidencia por empresa
router.get('/company/:companyId', companyIncidenceTypeController.getByCompany);

// Crear nuevo tipo de incidencia
router.post('/company/:companyId', companyIncidenceTypeController.create);

// Actualizar tipo de incidencia
router.put('/:typeId', companyIncidenceTypeController.update);

// Eliminar tipo de incidencia
router.delete('/:typeId', companyIncidenceTypeController.delete);

// Guardar plantilla completa (tipos + configuración)
router.post('/company/:companyId/template', companyIncidenceTypeController.saveTemplate);

// Obtener plantilla completa
router.get('/company/:companyId/template', companyIncidenceTypeController.getTemplate);

export default router;