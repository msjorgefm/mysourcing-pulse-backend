import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { authenticate } from '../middleware/auth';

// Importar multer usando require para compatibilidad con Docker
const multer = require('multer');

const router = Router();

// Configuración de multer para almacenar archivos
const storage = multer.diskStorage({
  destination: async (_req: any, _file: any, cb: any) => {
    const uploadDir = path.join(process.cwd(), 'resources', 'certificates');
    
    try {
      // Asegurarse de que el directorio existe
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, '');
    }
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedExtensions = ['.cer', '.key'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan archivos .cer y .key'));
    }
  }
});

// Todas las rutas requieren autenticación
router.use(authenticate);

// Endpoint para subir certificados
router.post('/upload/certificate', 
  upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'key', maxCount: 1 }
  ]), 
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Cast req to any para acceder a files
      const files = (req as any).files;
      
      if (!files) {
        res.status(400).json({
          success: false,
          error: 'No se enviaron archivos'
        });
        return;
      }

      const response: {
        certificateFile?: string;
        certificatePath?: string;
        keyFile?: string;
        keyPath?: string;
      } = {};
      
      if (files.certificate && files.certificate[0]) {
        response.certificateFile = files.certificate[0].filename;
        response.certificatePath = files.certificate[0].filename;
      }
      
      if (files.key && files.key[0]) {
        response.keyFile = files.key[0].filename;
        response.keyPath = files.key[0].filename;
      }
      
      res.json({
        success: true,
        files: response
      });
    } catch (error) {
      console.error('Error uploading certificates:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al subir los archivos' 
      });
    }
  }
);

// Endpoint para descargar certificados
router.get('/download/certificate/:filename', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'resources', 'certificates', filename);
    
    // Verificar que el archivo existe
    await fs.access(filePath);
    
    res.download(filePath);
  } catch (error) {
    res.status(404).json({ 
      success: false, 
      error: 'Archivo no encontrado' 
    });
  }
});

export default router;