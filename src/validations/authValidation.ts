import Joi from 'joi';

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const registerValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('OPERATOR', 'CLIENT', 'EMPLOYEE', 'ADMIN').required(),
  companyId: Joi.number().optional(),
  employeeId: Joi.number().optional()
});
