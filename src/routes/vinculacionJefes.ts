import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as vinculacionJefesController from '../controllers/vinculacionJefesController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener datos organizacionales para el formulario
router.get('/company/:companyId/organizational-data', vinculacionJefesController.getOrganizationalData);

// CRUD de vinculaciones de jefes
router.get('/company/:companyId', vinculacionJefesController.getVinculacionesByCompany);
router.get('/:id', vinculacionJefesController.getVinculacionById);
router.post('/', vinculacionJefesController.createVinculacion);
router.put('/:id', vinculacionJefesController.updateVinculacion);
router.delete('/:id', vinculacionJefesController.deleteVinculacion);

// Obtener empleados a cargo de un jefe
router.get('/:id/empleados', vinculacionJefesController.getEmpleadosACargo);

export default router;