"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeController = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const validation_1 = require("../middleware/validation");
const prisma = new client_1.PrismaClient();
exports.employeeController = {
    // Obtener todos los empleados
    async getAllEmployees(req, res) {
        try {
            const employees = await prisma.employee.findMany({
                include: {
                    company: true,
                    incidences: true
                },
                orderBy: { name: 'asc' }
            });
            res.json({
                success: true,
                data: employees,
                count: employees.length
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching all employees:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener empleados'
            });
        }
    },
    // Obtener todos los empleados de una empresa
    async getEmployeesByCompany(req, res) {
        try {
            const { companyId } = req.params;
            const employees = await prisma.employee.findMany({
                where: { companyId: parseInt(companyId) },
                include: {
                    company: true,
                    incidences: true
                },
                orderBy: { name: 'asc' }
            });
            res.json({
                success: true,
                data: employees,
                count: employees.length
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching employees:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener empleados'
            });
        }
    },
    // Crear nuevo empleado
    async createEmployee(req, res) {
        try {
            const validation = (0, validation_1.validateEmployee)(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validation.errors
                });
            }
            const employee = await prisma.employee.create({
                data: req.body,
                include: {
                    company: true
                }
            });
            logger_1.logger.info(`Employee created: ${employee.name}`);
            res.status(201).json({
                success: true,
                data: employee
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating employee:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear empleado'
            });
        }
    },
    // Actualizar empleado
    async updateEmployee(req, res) {
        try {
            const { id } = req.params;
            const validation = (0, validation_1.validateEmployee)(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validation.errors
                });
            }
            const employee = await prisma.employee.update({
                where: { id: parseInt(id) },
                data: req.body,
                include: {
                    company: true
                }
            });
            res.json({
                success: true,
                data: employee
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating employee:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar empleado'
            });
        }
    },
    // Eliminar empleado
    async deleteEmployee(req, res) {
        try {
            const { id } = req.params;
            await prisma.employee.delete({
                where: { id: parseInt(id) }
            });
            res.json({
                success: true,
                message: 'Empleado eliminado correctamente'
            });
        }
        catch (error) {
            logger_1.logger.error('Error deleting employee:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar empleado'
            });
        }
    }
};
//# sourceMappingURL=employeeController.js.map