import Joi from 'joi';

export const createCompanyValidation = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9\-\+\(\)\s]+$/).optional(),
  status: Joi.string().valid('En Configuración', 'Configurada', 'Activa', 'Inactiva').optional()
});

export const updateCompanyValidation = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9\-\+\(\)\s]+$/).optional(),
  status: Joi.string().valid('En Configuración', 'Configurada', 'Activa', 'Inactiva').optional()
});