// src/middleware/validation.ts
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Esquemas de validación
const workerDetailsSchema = Joi.object({
  numeroTrabajador: Joi.number().integer().positive().required(),
  nombres: Joi.string().min(2).max(100).required(),
  apellidoPaterno: Joi.string().min(2).max(100).required(),
  apellidoMaterno: Joi.string().min(2).max(100).optional(),
  fechaNacimiento: Joi.date().required(),
  sexo: Joi.string().valid('MASCULINO', 'FEMENINO').optional(),
  nacionalidad: Joi.string().valid('MEXICANA', 'EXTRANJERA').optional(),
  estadoCivil: Joi.string().valid('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO', 'UNION_LIBRE').required(),
  rfc: Joi.string().pattern(/^[A-Z]{4}\d{6}[A-Z0-9]{3}$/).required().messages({
    'string.pattern.base': 'El RFC debe tener el formato correcto (AAAA000000XXX)'
  }),
  curp: Joi.string().pattern(/^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/).required().messages({
    'string.pattern.base': 'El CURP debe tener el formato correcto'
  }),
  nss: Joi.string().pattern(/^\d{11}$/).required().messages({
    'string.pattern.base': 'El NSS debe tener 11 dígitos'
  }),
  umf: Joi.number().integer().positive().optional(),
  companyId: Joi.number().integer().positive().required()
});

const incidenceSchema = Joi.object({
  workerDetailsId: Joi.number().integer().positive().required(),
  companyId: Joi.number().integer().positive().required(),
  type: Joi.string().valid(
    'ABSENCE', 'VACATION', 'OVERTIME', 
    'PERMISSION', 'BONUS'
  ).required(),
  quantity: Joi.number().positive().required(),
  amount: Joi.number(),
  date: Joi.date().required(),
  description: Joi.string().max(500),
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'APPLIED').default('PENDING')
});

const payrollCalendarSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  companyId: Joi.number().integer().positive().required(),
  frequency: Joi.string().valid('quincenal', 'mensual').required(),
  startDate: Joi.date().required(),
  isActive: Joi.boolean().default(true)
});

const payrollPeriodSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  status: Joi.string().valid('draft', 'in_progress', 'completed', 'closed').default('draft'),
  workingDays: Joi.number().integer().min(1).max(31)
});

// Funciones de validación
export const validateWorkerDetails = (data: any) => {
  const { error } = workerDetailsSchema.validate(data);
  return {
    isValid: !error,
    errors: error ? error.details.map(d => d.message) : []
  };
};

export const validateIncidence = (data: any) => {
  const { error } = incidenceSchema.validate(data);
  return {
    isValid: !error,
    errors: error ? error.details.map(d => d.message) : []
  };
};

export const validatePayrollCalendar = (data: any) => {
  const { error } = payrollCalendarSchema.validate(data);
  return {
    isValid: !error,
    errors: error ? error.details.map(d => d.message) : []
  };
};

export const validatePayrollPeriod = (data: any) => {
  const { error } = payrollPeriodSchema.validate(data);
  return {
    isValid: !error,
    errors: error ? error.details.map(d => d.message) : []
  };
};

// Middleware de validación de parámetros
export const validateWorkerDetailsParams = (req: Request, res: Response, next: NextFunction) => {
  const { companyId } = req.params;
  
  if (!companyId || isNaN(parseInt(companyId))) {
    res.status(400).json({
      success: false,
      message: 'ID de empresa inválido'
    });
    return;
  }
  
  next();
};

export const validateIncidenceParams = (req: Request, res: Response, next: NextFunction) => {
  const { companyId, periodStart, periodEnd } = req.query;
  
  if (!companyId || !periodStart || !periodEnd) {
    res.status(400).json({
      success: false,
      message: 'Parámetros requeridos: companyId, periodStart, periodEnd'
    });
    return;
  }
  
  // Validar fechas
  const startDate = new Date(periodStart as string);
  const endDate = new Date(periodEnd as string);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    res.status(400).json({
      success: false,
      message: 'Formato de fecha inválido'
    });
    return;
  }
  
  if (startDate >= endDate) {
    res.status(400).json({
      success: false,
      message: 'La fecha de inicio debe ser anterior a la fecha de fin'
    });
    return;
  }
  
  next();
};

export const validateCalendarParams = (req: Request, res: Response, next: NextFunction) => {
  const { companyId, calendarId } = req.params;
  
  // Validar companyId si está presente
  if (companyId && isNaN(parseInt(companyId))) {
    res.status(400).json({
      success: false,
      message: 'ID de empresa inválido'
    });
    return;
  }
  
  // Validar calendarId si está presente
  if (calendarId && isNaN(parseInt(calendarId))) {
    res.status(400).json({
      success: false,
      message: 'ID de calendario inválido'
    });
    return;
  }
  
  next();
};

export const validatePeriodParams = (req: Request, res: Response, next: NextFunction) => {
  const { calendarId, periodId } = req.params;
  
  // Validar calendarId
  if (!calendarId || isNaN(parseInt(calendarId))) {
    res.status(400).json({
      success: false,
      message: 'ID de calendario inválido'
    });
    return;
  }
  
  // Validar periodId si está presente
  if (periodId && isNaN(parseInt(periodId))) {
    res.status(400).json({
      success: false,
      message: 'ID de período inválido'
    });
    return;
  }
  
  // Si hay datos en el body para crear/actualizar período, validarlos
  if (req.method === 'POST' || req.method === 'PUT') {
    // Validar usando el esquema de Joi directamente
    const { error } = payrollPeriodSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Datos del período inválidos',
        errors: error.details.map(d => d.message)
      });
      return;
    }
    
    // Validación adicional: startDate debe ser menor que endDate
    if (req.body.startDate && req.body.endDate) {
      const startDate = new Date(req.body.startDate);
      const endDate = new Date(req.body.endDate);
      
      if (startDate >= endDate) {
        res.status(400).json({
          success: false,
          message: 'La fecha de inicio debe ser anterior a la fecha de fin'
        });
        return;
      }
    }
  }
  
  next();
};

// Middleware adicional para validar query parameters de calendarios
export const validateCalendarQuery = (req: Request, res: Response, next: NextFunction) => {
  const { status, year } = req.query;
  
  // Validar status si está presente
  if (status && !['draft', 'in_progress', 'completed', 'closed'].includes(status as string)) {
    res.status(400).json({
      success: false,
      message: 'Status inválido. Valores permitidos: draft, in_progress, completed, closed'
    });
    return;
  }
  
  // Validar year si está presente
  if (year) {
    const yearNum = parseInt(year as string);
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
      res.status(400).json({
        success: false,
        message: 'Año inválido. Debe estar entre 2020 y 2030'
      });
      return;
    }
  }
  
  next();
};

// Middleware para validar datos de generación de períodos
export const validateGeneratePeriods = (req: Request, res: Response, next: NextFunction) => {
  const { year, frequency } = req.body;
  
  if (!year || !frequency) {
    res.status(400).json({
      success: false,
      message: 'Año y frecuencia son requeridos'
    });
    return;
  }
  
  // Validar año
  const yearNum = parseInt(year);
  if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
    res.status(400).json({
      success: false,
      message: 'Año inválido. Debe estar entre 2020 y 2030'
    });
    return;
  }
  
  // Validar frecuencia
  if (!['quincenal', 'mensual', 'semanal', 'decenal'].includes(frequency)) {
    res.status(400).json({
      success: false,
      message: 'Frecuencia inválida. Valores permitidos: quincenal, mensual, semanal, decenal'
    });
    return;
  }
  
  next();
};