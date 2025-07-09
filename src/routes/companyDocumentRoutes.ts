import express from 'express';
import { CompanyDocumentController } from '../controllers/companyDocumentController';
import { authenticate } from '../middleware/auth';
import { upload } from '../services/companyDocumentService';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Subir un documento
router.post(
  '/:companyId/documents/:documentType',
  upload.single('document'),
  CompanyDocumentController.uploadDocument
);

// Obtener todos los documentos de una empresa
router.get('/:companyId/documents', CompanyDocumentController.getCompanyDocuments);

// Obtener el checklist de documentos
router.get('/:companyId/checklist', CompanyDocumentController.getDocumentChecklist);

// Obtener documentos por tipo
router.get('/:companyId/documents/type/:documentType', CompanyDocumentController.getDocumentsByType);

// Descargar un documento
router.get('/:companyId/documents/:documentId/download', CompanyDocumentController.downloadDocument);

// Eliminar un documento
router.delete('/:companyId/documents/:documentId', CompanyDocumentController.deleteDocument);

export default router;