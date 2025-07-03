import Joi from 'joi';

export const createEmployeeValidation = Joi.object({
  employeeNumber: Joi.string().min(1).max(20).required(),
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  rfc: Joi.string().min(12).max(13).required(),
  position: Joi.string().min(2).max(100).required(),
  department: Joi.string().min(2).max(100).required(),
  salary: Joi.number().positive().required(),
  hireDate: Joi.date().iso().required(),
  companyId: Joi.number().integer().positive().required(),
  bankName: Joi.string().max(100).optional(),
  accountNumber: Joi.string().max(20).optional(),
  clabe: Joi.string().length(18).optional()
});

export const updateEmployeeValidation = Joi.object({
  employeeNumber: Joi.string().min(1).max(20).optional(),
  name: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional(),
  rfc: Joi.string().min(12).max(13).optional(),
  position: Joi.string().min(2).max(100).optional(),
  department: Joi.string().min(2).max(100).optional(),
  salary: Joi.number().positive().optional(),
  hireDate: Joi.date().iso().optional(),
  bankName: Joi.string().max(100).optional(),
  accountNumber: Joi.string().max(20).optional(),
  clabe: Joi.string().length(18).optional()
});