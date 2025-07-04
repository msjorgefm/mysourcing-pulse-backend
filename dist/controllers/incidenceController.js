"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incidenceController = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const validation_1 = require("../middleware/validation");
const calculator_1 = require("../utils/calculator");
const prisma = new client_1.PrismaClient();
exports.incidenceController = {
    // Obtener todas las incidencias
    async getAllIncidences(req, res) {
        try {
            const incidences = await prisma.incidence.findMany({
                include: {
                    employee: true,
                    company: true
                },
                orderBy: { date: 'desc' }
            });
            res.json({
                success: true,
                data: incidences,
                count: incidences.length
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching all incidences:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener incidencias'
            });
        }
    },
    // Obtener incidencias por empresa y período
    async getIncidencesByPeriod(req, res) {
        try {
            const { companyId, periodStart, periodEnd } = req.query;
            const incidences = await prisma.incidence.findMany({
                where: {
                    companyId: parseInt(companyId),
                    date: {
                        gte: new Date(periodStart),
                        lte: new Date(periodEnd)
                    }
                },
                include: {
                    employee: true,
                    company: true
                },
                orderBy: { date: 'desc' }
            });
            res.json({
                success: true,
                data: incidences,
                count: incidences.length
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching incidences:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener incidencias'
            });
        }
    },
    // Crear nueva incidencia
    async createIncidence(req, res) {
        try {
            const validation = (0, validation_1.validateIncidence)(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validation.errors
                });
            }
            // Obtener datos del empleado para calcular monto
            const employee = await prisma.employee.findUnique({
                where: { id: req.body.employeeId }
            });
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: 'Empleado no encontrado'
                });
            }
            // Calcular monto automáticamente
            const employeeForCalculation = {
                ...employee,
                salary: Number(employee.baseSalary),
                isActive: employee.status === 'ACTIVE'
            };
            const calculatedAmount = (0, calculator_1.calculateIncidenceAmount)(req.body.type, employeeForCalculation, req.body.quantity);
            const incidence = await prisma.incidence.create({
                data: {
                    ...req.body,
                    amount: calculatedAmount
                },
                include: {
                    employee: true,
                    company: true
                }
            });
            logger_1.logger.info(`Incidence created for employee: ${employee.name}`);
            res.status(201).json({
                success: true,
                data: incidence
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating incidence:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear incidencia'
            });
        }
    },
    // Actualizar incidencia
    async updateIncidence(req, res) {
        try {
            const { id } = req.params;
            const validation = (0, validation_1.validateIncidence)(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validation.errors
                });
            }
            // Recalcular monto si cambió la cantidad o tipo
            const employee = await prisma.employee.findUnique({
                where: { id: req.body.employeeId }
            });
            const employeeForCalculation = {
                ...employee,
                salary: Number(employee.baseSalary),
                isActive: employee.status === 'ACTIVE'
            };
            const calculatedAmount = (0, calculator_1.calculateIncidenceAmount)(req.body.type, employeeForCalculation, req.body.quantity);
            const incidence = await prisma.incidence.update({
                where: { id: parseInt(id) },
                data: {
                    ...req.body,
                    amount: calculatedAmount
                },
                include: {
                    employee: true,
                    company: true
                }
            });
            res.json({
                success: true,
                data: incidence
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating incidence:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar incidencia'
            });
        }
    },
    // Eliminar incidencia
    async deleteIncidence(req, res) {
        try {
            const { id } = req.params;
            await prisma.incidence.delete({
                where: { id: parseInt(id) }
            });
            res.json({
                success: true,
                message: 'Incidencia eliminada correctamente'
            });
        }
        catch (error) {
            logger_1.logger.error('Error deleting incidence:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar incidencia'
            });
        }
    },
    // Obtener estadísticas de incidencias
    async getIncidenceStats(req, res) {
        try {
            const { companyId, periodStart, periodEnd } = req.query;
            const stats = await prisma.incidence.groupBy({
                by: ['type'],
                where: {
                    companyId: parseInt(companyId),
                    date: {
                        gte: new Date(periodStart),
                        lte: new Date(periodEnd)
                    }
                },
                _count: true,
                _sum: {
                    amount: true,
                    quantity: true
                }
            });
            res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching incidence stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas'
            });
        }
    }
};
//# sourceMappingURL=incidenceController.js.map