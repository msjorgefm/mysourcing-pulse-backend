import { Router } from 'express';
import { workerDetailsController } from '../controllers/workerDetailsController';
import { validateWorkerDetailsParams } from '../middleware/validation';
import path from 'path';
import fs from 'fs';

const multer = require('multer');
const router = Router();

// Configuración de multer para carga de archivos (Excel/CSV)
const upload = multer({
  dest: path.join(__dirname, '../../temp'),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// Configuración de multer para fotos de perfil
const photoStorage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadPath = path.join(__dirname, '../../resources/photos');
    // Crear el directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `worker-${req.params.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const photoUpload = multer({
  storage: photoStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

// GET /api/workers
router.get('/', async (req, res, next) => {
  try {
    await workerDetailsController.getAllWorkerDetails(req, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/workers/company/:companyId
router.get('/company/:companyId', 
  validateWorkerDetailsParams,
  workerDetailsController.getWorkerDetailsByCompany
);

// POST /api/workers
router.post('/', async (req, res, next) => {
  try {
    await workerDetailsController.createWorkerDetails(req, res);
  } catch (err) {
    next(err);
  }
});

// PUT /api/workers/:id
router.put('/:id', async (req, res, next) => {
  try {
    await workerDetailsController.updateWorkerDetails(req, res);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/workers/:id
router.delete('/:id', async (req, res, next) => {
  try {
    await workerDetailsController.deleteWorkerDetails(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /api/workers/company/:companyId/validate
router.post('/company/:companyId/validate', async (req, res, next) => {
  try {
    await workerDetailsController.validateBulkWorkers(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /api/workers/company/:companyId/bulk
router.post('/company/:companyId/bulk', async (req, res, next) => {
  try {
    await workerDetailsController.createBulkWorkers(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /api/workers/create - Crear trabajador individual (con todos los datos)
router.post('/create', async (req, res, next) => {
  try {
    await workerDetailsController.createSingleWorker(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /api/workers/:id/send-invitation - Enviar invitación al portal
router.post('/:id/send-invitation', async (req, res, next) => {
  try {
    await workerDetailsController.sendPortalInvitation(req, res);
  } catch (err) {
    next(err);
  }
});

// POST /api/workers/:id/upload-photo - Subir foto de perfil
router.post('/:id/upload-photo', photoUpload.single('photo'), async (req, res, next) => {
  try {
    await workerDetailsController.uploadPhoto(req, res);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/workers/:id/photo - Eliminar foto de perfil
router.delete('/:id/photo', async (req, res, next) => {
  try {
    await workerDetailsController.deletePhoto(req, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/workers/company/:companyId/payroll-calendars
router.get('/company/:companyId/payroll-calendars', async (req, res, next) => {
  try {
    await workerDetailsController.getCompanyPayrollCalendars(req, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/workers/company/:companyId/departments
router.get('/company/:companyId/departments', async (req, res, next) => {
  try {
    await workerDetailsController.getDepartmentsByArea(req, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/workers/company/:companyId/departments/:areaId
router.get('/company/:companyId/departments/:areaId', async (req, res, next) => {
  try {
    await workerDetailsController.getDepartmentsByArea(req, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/workers/company/:companyId/positions
router.get('/company/:companyId/positions', async (req, res, next) => {
  try {
    await workerDetailsController.getPositions(req, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/workers/company/:companyId/template
router.get('/company/:companyId/template', async (req, res, next) => {
  try {
    await workerDetailsController.getEmployeeTemplate(req, res);
  } catch (err) {
    next(err);
  }
});

// GET /api/workers/:id
router.get('/:id', async (req, res, next) => {
  try {
    await workerDetailsController.getWorkerDetailsById(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;