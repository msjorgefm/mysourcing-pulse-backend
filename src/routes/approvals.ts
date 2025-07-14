import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { PayrollApprovalController } from '../controllers/payrollApprovalController';
import { IncidenciasController } from '../controllers/incidenciasController';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// ===== RUTAS DE APROBACIÓN DE NÓMINAS =====

// Obtener nóminas pendientes de aprobación
router.get('/companies/:companyId/payrolls/pending', PayrollApprovalController.getPendingPayrolls);

// Aprobar nómina
router.post('/payrolls/:payrollId/approve', PayrollApprovalController.approvePayroll);

// Rechazar nómina
router.post('/payrolls/:payrollId/reject', PayrollApprovalController.rejectPayroll);

// Obtener historial de aprobaciones de nómina
router.get('/companies/:companyId/payrolls/history', PayrollApprovalController.getApprovalHistory);

// ===== RUTAS DE APROBACIÓN DE INCIDENCIAS =====

// Obtener incidencias pendientes de aprobación (solo las creadas por jefes)
router.get('/companies/:companyId/incidencias/pending', IncidenciasController.getPendingIncidencias);

// Aprobar incidencia
router.post('/incidencias/:id/approve', IncidenciasController.approveIncidencia);

// Rechazar incidencia
router.post('/incidencias/:id/reject', IncidenciasController.rejectIncidencia);

// Obtener incidencias con filtros
router.get('/companies/:companyId/incidencias/filtered', IncidenciasController.getIncidenciasWithFilters);

export default router;