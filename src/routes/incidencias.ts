import express from 'express';
import { IncidenciasController } from '../controllers/incidenciasController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear incidencias en lote
router.post('/incidencias/companies/:companyId/incidencias/bulk', 
  authorize(['OPERATOR', 'CLIENT', 'ADMIN', 'DEPARTMENT_HEAD']), 
  async (req, res, next) => {
    try {
      await IncidenciasController.createBulkIncidencias(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Obtener incidencias por empresa
router.get('/incidencias/companies/:companyId/incidencias', 
  authorize(['OPERATOR', 'CLIENT', 'ADMIN', 'DEPARTMENT_HEAD']), 
  async (req, res, next) => {
    try {
      await IncidenciasController.getIncidenciasByCompany(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Actualizar incidencia
router.put('/incidencias/:id', 
  authorize(['OPERATOR', 'CLIENT', 'ADMIN', 'DEPARTMENT_HEAD']), 
  async (req, res, next) => {
    try {
      await IncidenciasController.updateIncidencia(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Eliminar incidencia
router.delete('/incidencias/:id', 
  authorize(['OPERATOR', 'CLIENT', 'ADMIN', 'DEPARTMENT_HEAD']), 
  async (req, res, next) => {
    try {
      await IncidenciasController.deleteIncidencia(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Aprobar incidencia
router.post('/incidencias/:id/approve', 
  authorize(['CLIENT']), 
  async (req, res, next) => {
    try {
      await IncidenciasController.approveIncidencia(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Rechazar incidencia
router.post('/incidencias/:id/reject', 
  authorize(['CLIENT']), 
  async (req, res, next) => {
    try {
      await IncidenciasController.rejectIncidencia(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Obtener incidencias pendientes de aprobación
router.get('/incidencias/companies/:companyId/incidencias/pending', 
  authorize(['CLIENT']), 
  async (req, res, next) => {
    try {
      await IncidenciasController.getPendingIncidencias(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Obtener incidencias con filtros
router.get('/incidencias/companies/:companyId/incidencias/filtered', 
  authorize(['OPERATOR', 'CLIENT', 'ADMIN', 'DEPARTMENT_HEAD']), 
  async (req, res, next) => {
    try {
      await IncidenciasController.getIncidenciasWithFilters(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Obtener historial de aprobaciones
router.get('/incidencias/companies/:companyId/incidencias/history', 
  authorize(['CLIENT']), 
  async (req, res, next) => {
    try {
      await IncidenciasController.getApprovalHistory(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Descargar plantilla de incidencias
router.get('/incidencias/companies/:companyId/incidencias/template', 
  authorize(['OPERATOR', 'CLIENT', 'DEPARTMENT_HEAD']), 
  async (req, res, next) => {
    try {
      await IncidenciasController.downloadTemplate(req, res);
    } catch (err) {
      next(err);
    }
  }
);

export default router;