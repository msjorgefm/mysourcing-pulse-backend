import Joi from 'joi';

export const createCompanyValidation = Joi.object({
  name: Joi.string().min(2).max(255).optional(), // Opcional, se puede usar legalName
  rfc: Joi.string().allow('').optional(), // Opcional y puede estar vacío
  legalName: Joi.string().min(2).max(255).required(),
  address: Joi.string().allow('').optional(), // Opcional y puede estar vacío
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9\-\+\(\)\s]+$/).required(),
  status: Joi.string().valid('En Configuración', 'Configurada', 'Activa', 'Inactiva').optional()
});

export const updateCompanyValidation = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  rfc: Joi.string().min(12).max(13).optional(),
  legalName: Joi.string().min(2).max(255).optional(),
  address: Joi.string().min(10).max(500).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9\-\+\(\)\s]+$/).optional(),
  status: Joi.string().valid('En Configuración', 'Configurada', 'Activa', 'Inactiva').optional()
});