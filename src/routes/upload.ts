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

// Configuración de multer para archivos de identificación
const identificationStorage = multer.diskStorage({
  destination: async (_req: any, _file: any, cb: any) => {
    const uploadDir = path.join(process.cwd(), 'resources', 'identifications-types');
    
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

const uploadIdentification = multer({ 
  storage: identificationStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan archivos PDF, JPG, JPEG y PNG'));
    }
  }
});

// Configuración de multer para archivos de poder notarial
const notarialPowerStorage = multer.diskStorage({
  destination: async (_req: any, _file: any, cb: any) => {
    const uploadDir = path.join(process.cwd(), 'resources', 'notarial-powers');
    
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

const uploadNotarialPower = multer({ 
  storage: notarialPowerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan archivos PDF, JPG, JPEG y PNG'));
    }
  }
});

// Configuración de multer para archivos de registro patronal
const registroPatronalStorage = multer.diskStorage({
  destination: async (_req: any, _file: any, cb: any) => {
    const uploadDir = path.join(process.cwd(), 'resources', 'registro-patronal');
    
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

const uploadRegistroPatronal = multer({ 
  storage: registroPatronalStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan archivos PDF, JPG, JPEG y PNG'));
    }
  }
});

// Todas las rutas requieren autenticación
router.use(authenticate);

// Middleware para manejar errores de Multer
const handleMulterError = (err: any, req: Request, res: Response, next: any) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer Error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        error: 'El archivo es demasiado grande. Límite: 10MB'
      });
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        error: 'Campo de archivo inesperado',
        field: err.field
      });
    } else {
      res.status(400).json({
        success: false,
        error: err.message
      });
    }
  } else if (err) {
    console.error('Upload Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Error al procesar el archivo'
    });
  } else {
    next();
  }
};

// Endpoint para subir certificados
router.post('/certificate', 
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

// Endpoint para subir archivos de identificación - Simplificado
router.post('/identification', 
  uploadIdentification.any(), // Acepta cualquier campo
  handleMulterError,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = (req as any).files;
      
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No se envió ningún archivo',
          debug: {
            headers: req.headers,
            body: req.body,
            filesReceived: files
          }
        });
        return;
      }

      const uploadedFile = files[0];

      res.json({
        success: true,
        file: {
          filename: uploadedFile.filename,
          originalName: uploadedFile.originalname,
          size: uploadedFile.size,
          path: uploadedFile.filename,
          fieldname: uploadedFile.fieldname // Para saber qué campo usó el frontend
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al subir el archivo',
        stack: error instanceof Error ? error.stack : undefined
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

// Endpoint para subir archivos de poder notarial - Simplificado
router.post('/notarial-power', 
  uploadNotarialPower.any(), // Acepta cualquier campo
  handleMulterError,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = (req as any).files;
      
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No se envió ningún archivo',
          debug: {
            headers: req.headers,
            body: req.body,
            filesReceived: files
          }
        });
        return;
      }

      const uploadedFile = files[0];

      res.json({
        success: true,
        file: {
          filename: uploadedFile.filename,
          originalName: uploadedFile.originalname,
          size: uploadedFile.size,
          path: uploadedFile.filename,
          fieldname: uploadedFile.fieldname // Para saber qué campo usó el frontend
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al subir el archivo',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
);

// Endpoint para descargar archivos de identificación
router.get('/download/identification/:filename', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'resources', 'identifications-types', filename);
    
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

// Endpoint para subir archivos de registro patronal - Simplificado
router.post('/registro-patronal', 
  uploadRegistroPatronal.any(), // Acepta cualquier campo
  handleMulterError,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = (req as any).files;
      
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No se envió ningún archivo',
          debug: {
            headers: req.headers,
            body: req.body,
            filesReceived: files
          }
        });
        return;
      }

      const uploadedFile = files[0];

      res.json({
        success: true,
        file: {
          filename: uploadedFile.filename,
          originalName: uploadedFile.originalname,
          size: uploadedFile.size,
          path: uploadedFile.filename,
          fieldname: uploadedFile.fieldname // Para saber qué campo usó el frontend
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al subir el archivo',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
);

// Endpoint para descargar archivos de poder notarial
router.get('/download/notarial-power/:filename', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'resources', 'notarial-powers', filename);
    
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

// Endpoint para descargar archivos de registro patronal
router.get('/download/registro-patronal/:filename', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'resources', 'registro-patronal', filename);
    
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

// Configuración de multer para archivos FONACOT
const fonacotStorage = multer.diskStorage({
  destination: async (_req: any, _file: any, cb: any) => {
    const uploadDir = path.join(process.cwd(), 'resources', 'fonacot');
    
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

const uploadFonacot = multer({ 
  storage: fonacotStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan archivos PDF, JPG, JPEG y PNG'));
    }
  }
});

// Endpoint para subir archivos FONACOT
router.post('/fonacot', 
  uploadFonacot.any(), // Acepta cualquier campo
  handleMulterError,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = (req as any).files;
      
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No se envió ningún archivo',
          debug: {
            headers: req.headers,
            body: req.body,
            filesReceived: files
          }
        });
        return;
      }

      const uploadedFile = files[0];

      res.json({
        success: true,
        file: {
          filename: uploadedFile.filename,
          originalName: uploadedFile.originalname,
          size: uploadedFile.size,
          path: uploadedFile.filename,
          fieldname: uploadedFile.fieldname // Para saber qué campo usó el frontend
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al subir el archivo',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
);

// Endpoint para descargar archivos FONACOT
router.get('/download/fonacot/:filename', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'resources', 'fonacot', filename);
    
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