// src/routes/payrollPeriods.ts
import express from 'express';
import { payrollPeriodController } from '../controllers/payrollPeriodController';
import { authenticate } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configuración de multer para archivos de nómina
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/payroll-files/';
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.pdf', '.txt', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener períodos de un calendario
router.get('/calendar/:calendarId', payrollPeriodController.getPeriodsByCalendar);

// Obtener períodos finalizados de un calendario
router.get('/calendar/:calendarId/finalized', payrollPeriodController.getFinalizedPeriodsByCalendar);

// Crear períodos para un calendario
router.post('/calendar/:calendarId', payrollPeriodController.createPeriodsForCalendar);

// Cambiar estado de un período
router.patch('/:periodId/status', payrollPeriodController.updatePeriodStatus);

// Subir archivo de prenómina
router.post('/:periodId/prenomina', upload.single('file'), payrollPeriodController.uploadPrenominaFile);

// Descargar archivo de prenómina
router.get('/:periodId/prenomina/download', payrollPeriodController.downloadPrenomina);

// Subir archivo de layouts
router.post('/:periodId/layouts', upload.single('file'), payrollPeriodController.uploadLayoutsFile);

// Obtener estado actual de un período
router.get('/:periodId/status', payrollPeriodController.getPeriodStatus);

// Obtener resumen completo del período
router.get('/:periodId/summary', payrollPeriodController.getPeriodSummary);

// Aprobar prenómina
router.post('/:periodId/prenomina/approve', payrollPeriodController.approvePrenomina);

// Rechazar prenómina
router.post('/:periodId/prenomina/reject', payrollPeriodController.rejectPrenomina);

// Descargar archivo de layouts
router.get('/:periodId/layouts/download', payrollPeriodController.downloadLayouts);

// Aprobar layouts
router.post('/:periodId/layouts/approve', payrollPeriodController.approveLayouts);

// Rechazar layouts
router.post('/:periodId/layouts/reject', payrollPeriodController.rejectLayouts);

// Subir archivo de timbrado
router.post('/:periodId/timbrado', upload.single('file'), payrollPeriodController.uploadTimbradoFile);

// Descargar archivo de timbrado
router.get('/:periodId/timbrado/download', payrollPeriodController.downloadTimbrado);

export default router;