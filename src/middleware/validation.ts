import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Esquemas de validación
const employeeSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  employeeNumber: Joi.string().min(1).max(50).required(),
  position: Joi.string().max(100),
  department: Joi.string().max(100),
  salary: Joi.number().positive().required(),
  companyId: Joi.number().integer().positive().required(),
  hireDate: Joi.date(),
  isActive: Joi.boolean().default(true)
});

const incidenceSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  companyId: Joi.number().integer().positive().required(),
  type: Joi.string().valid(
    'faltas', 'vacaciones', 'tiempo_extra', 
    'permisos', 'bonos', 'descuentos'
  ).required(),
  quantity: Joi.number().positive().required(),
  amount: Joi.number(),
  date: Joi.date().required(),
  comments: Joi.string().max(500),
  periodStart: Joi.date(),
  periodEnd: Joi.date()
});

const payrollCalendarSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  companyId: Joi.number().integer().positive().required(),
  frequency: Joi.string().valid('quincenal', 'mensual').required(),
  startDate: Joi.date().required(),
  isActive: Joi.boolean().default(true)
});

// Funciones de validación
export const validateEmployee = (data: any) => {
  const { error } = employeeSchema.validate(data);
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

// Middleware de validación de parámetros
export const validateEmployeeParams = (req: Request, res: Response, next: NextFunction) => {
  const { companyId } = req.params;
  
  if (!companyId || isNaN(parseInt(companyId))) {
    return res.status(400).json({
      success: false,
      message: 'ID de empresa inválido'
    });
  }
  
  next();
};

export const validateIncidenceParams = (req: Request, res: Response, next: NextFunction) => {
  const { companyId, periodStart, periodEnd } = req.query;
  
  if (!companyId || !periodStart || !periodEnd) {
    return res.status(400).json({
      success: false,
      message: 'Parámetros requeridos: companyId, periodStart, periodEnd'
    });
  }
  
  // Validar fechas
  const startDate = new Date(periodStart as string);
  const endDate = new Date(periodEnd as string);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Formato de fecha inválido'
    });
  }
  
  if (startDate >= endDate) {
    return res.status(400).json({
      success: false,
      message: 'La fecha de inicio debe ser anterior a la fecha de fin'
    });
  }
  
  next();
};