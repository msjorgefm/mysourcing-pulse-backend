import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { requestController } from '../controllers/requestController';
import { validateRequest } from '../middleware/validation';
import Joi from 'joi';
import path from 'path';
import fs from 'fs/promises';

// Importar multer usando require para compatibilidad
const multer = require('multer');

const router = Router();

// Configuración de multer para archivos de solicitudes
const requestStorage = multer.diskStorage({
  destination: async (_req: any, _file: any, cb: any) => {
    const uploadDir = path.join(process.cwd(), 'resources', 'solicitudes');
    
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

const uploadRequest = multer({ 
  storage: requestStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Middleware para manejar errores de Multer
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'El archivo es demasiado grande. Límite: 10MB'
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message
    });
  } else if (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Error al procesar el archivo'
    });
  }
  next();
};

// Esquema de validación para crear solicitud
const createRequestSchema = Joi.object({
  type: Joi.string().valid('EMPLOYEE_REGISTRATION', 'EMPLOYEE_TERMINATION', 'SALARY_MODIFICATION', 'PAYROLL_CORRECTION', 'GENERAL_INQUIRY').required().messages({
    'any.only': 'Tipo de solicitud inválido'
  }),
  priority: Joi.string().valid('CRITICAL', 'HIGH', 'MEDIUM', 'LOW').required().messages({
    'any.only': 'Prioridad inválida'
  }),
  subject: Joi.string().trim().min(1).required().messages({
    'string.empty': 'El asunto es requerido'
  }),
  description: Joi.string().trim().min(1).required().messages({
    'string.empty': 'La descripción es requerida'
  }),
  dueDate: Joi.date().iso().optional().messages({
    'date.format': 'Fecha inválida'
  }),
  customFields: Joi.object().optional(),
  attachments: Joi.array().items(Joi.object()).optional()
});

// Esquema de validación para actualizar solicitud
const updateRequestSchema = Joi.object({
  status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'PENDING_INFO', 'RESOLVED', 'CANCELLED').optional().messages({
    'any.only': 'Estado inválido'
  }),
  priority: Joi.string().valid('CRITICAL', 'HIGH', 'MEDIUM', 'LOW').optional().messages({
    'any.only': 'Prioridad inválida'
  }),
  subject: Joi.string().trim().min(1).optional().messages({
    'string.empty': 'El asunto no puede estar vacío'
  }),
  description: Joi.string().trim().min(1).optional().messages({
    'string.empty': 'La descripción no puede estar vacía'
  }),
  dueDate: Joi.date().iso().optional().messages({
    'date.format': 'Fecha inválida'
  }),
  assignedToId: Joi.number().integer().optional().messages({
    'number.base': 'ID de operador inválido'
  }),
  assignedToName: Joi.string().trim().min(1).optional().messages({
    'string.empty': 'Nombre de operador requerido'
  })
});

// Middleware de validación para query params
const validateRequestQuery = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    status: Joi.string().valid('OPEN', 'IN_PROGRESS', 'PENDING_INFO', 'RESOLVED', 'CANCELLED').optional(),
    type: Joi.string().valid('EMPLOYEE_REGISTRATION', 'EMPLOYEE_TERMINATION', 'SALARY_MODIFICATION', 'PAYROLL_CORRECTION', 'GENERAL_INQUIRY').optional(),
    priority: Joi.string().valid('CRITICAL', 'HIGH', 'MEDIUM', 'LOW').optional(),
    dateFrom: Joi.date().iso().optional(),
    dateTo: Joi.date().iso().optional(),
    search: Joi.string().trim().optional(),
    clientId: Joi.string().optional(),
    assignedToId: Joi.string().optional()
  });
  
  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros de búsqueda inválidos',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  next();
};

// Esquema de validación para comentarios
const addCommentSchema = Joi.object({
  text: Joi.string().trim().min(1).required().messages({
    'string.empty': 'El comentario no puede estar vacío'
  })
});

// Esquema de validación para asignar solicitud
const assignRequestSchema = Joi.object({
  operatorId: Joi.number().integer().required().messages({
    'number.base': 'ID de operador inválido'
  }),
  operatorName: Joi.string().trim().min(1).required().messages({
    'string.empty': 'Nombre de operador requerido'
  })
});

// Rutas protegidas con autenticación
router.use(authenticate);

// Middleware para parsear customFields de FormData y logging
const parseFormData = (req: Request, _res: Response, next: NextFunction) => {
  console.log('ParseFormData - Body before parsing:', req.body);
  console.log('ParseFormData - Files:', (req as any).files?.length || 0);
  
  if (req.body.customFields && typeof req.body.customFields === 'string') {
    try {
      req.body.customFields = JSON.parse(req.body.customFields);
    } catch (error) {
      req.body.customFields = {};
    }
  }
  
  console.log('ParseFormData - Body after parsing:', req.body);
  next();
};

// Crear nueva solicitud con archivos
router.post(
  '/',
  uploadRequest.any(), // Acepta cualquier campo, incluidos archivos
  handleMulterError,
  parseFormData,
  validateRequest(createRequestSchema),
  requestController.createRequest
);

// Obtener solicitudes con filtros
router.get(
  '/',
  validateRequestQuery,
  requestController.getRequests
);

// Obtener estadísticas de solicitudes
router.get(
  '/stats',
  requestController.getRequestStats
);

// Obtener solicitudes del usuario actual
router.get(
  '/my-requests',
  requestController.getMyRequests
);

// Obtener solicitud por ID
router.get(
  '/:id',
  requestController.getRequestById
);

// Actualizar solicitud
router.put(
  '/:id',
  validateRequest(updateRequestSchema),
  requestController.updateRequest
);

// Asignar solicitud a operador (solo admin)
router.post(
  '/:id/assign',
  validateRequest(assignRequestSchema),
  requestController.assignRequest
);

// Agregar comentario a solicitud
router.post(
  '/:id/comments',
  validateRequest(addCommentSchema),
  requestController.addComment
);

// Descargar archivo adjunto
router.get('/attachments/:filename', async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), 'resources', 'solicitudes', filename);
    
    console.log('Descargando archivo:', filename);
    console.log('Ruta completa:', filePath);
    
    // Verificar que el archivo existe
    await fs.access(filePath);
    
    res.download(filePath);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    console.error('Archivo buscado:', path.join(process.cwd(), 'resources', 'solicitudes', req.params.filename));
    res.status(404).json({ 
      success: false, 
      error: 'Archivo no encontrado' 
    });
  }
});

export default router;