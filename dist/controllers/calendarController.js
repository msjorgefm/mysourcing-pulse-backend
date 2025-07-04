"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarController = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const validation_1 = require("../middleware/validation");
const library_1 = require("@prisma/client/runtime/library");
const prisma = new client_1.PrismaClient();
exports.calendarController = {
    // Obtener todos los calendarios
    async getAllCalendars(req, res) {
        try {
            const calendars = await prisma.calendar.findMany({
                include: {
                    company: true
                },
                orderBy: { name: 'asc' }
            });
            res.json({
                success: true,
                data: calendars,
                count: calendars.length
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching all calendars:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener calendarios'
            });
        }
    },
    // Obtener calendarios de una empresa
    async getCalendarsByCompany(req, res) {
        try {
            const { companyId } = req.params;
            const calendars = await prisma.calendar.findMany({
                where: { companyId: parseInt(companyId) },
                include: {
                    company: true
                },
                orderBy: { name: 'asc' }
            });
            res.json({
                success: true,
                data: calendars
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching calendars:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener calendarios'
            });
        }
    },
    // Obtener calendario por ID
    async getCalendarById(req, res) {
        try {
            const { id } = req.params;
            const calendar = await prisma.calendar.findUnique({
                where: { id: parseInt(id) },
                include: {
                    company: true
                }
            });
            if (!calendar) {
                return res.status(404).json({
                    success: false,
                    message: 'Calendario no encontrado'
                });
            }
            res.json({
                success: true,
                data: calendar
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching calendar:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener calendario'
            });
        }
    },
    // Crear nuevo calendario
    async createCalendar(req, res) {
        try {
            const validation = (0, validation_1.validatePayrollCalendar)(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validation.errors
                });
            }
            const calendar = await prisma.calendar.create({
                data: req.body,
                include: {
                    company: true
                }
            });
            logger_1.logger.info(`Calendar created: ${calendar.name}`);
            res.status(201).json({
                success: true,
                data: calendar
            });
        }
        catch (error) {
            logger_1.logger.error('Error creating calendar:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear calendario'
            });
        }
    },
    // Actualizar calendario
    async updateCalendar(req, res) {
        try {
            const { id } = req.params;
            const validation = (0, validation_1.validatePayrollCalendar)(req.body);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos inválidos',
                    errors: validation.errors
                });
            }
            const calendar = await prisma.calendar.update({
                where: { id: parseInt(id) },
                data: req.body,
                include: {
                    company: true
                }
            });
            logger_1.logger.info(`Calendar updated: ${calendar.name}`);
            res.json({
                success: true,
                data: calendar
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating calendar:', error);
            if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Calendario no encontrado'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Error al actualizar calendario'
            });
        }
    },
    // Eliminar calendario
    async deleteCalendar(req, res) {
        try {
            const { id } = req.params;
            await prisma.calendar.delete({
                where: { id: parseInt(id) }
            });
            logger_1.logger.info(`Calendar deleted: ${id}`);
            res.json({
                success: true,
                message: 'Calendario eliminado exitosamente'
            });
        }
        catch (error) {
            logger_1.logger.error('Error deleting calendar:', error);
            if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2025') {
                return res.status(404).json({
                    success: false,
                    message: 'Calendario no encontrado'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Error al eliminar calendario'
            });
        }
    },
    // Obtener información del calendario
    async getCalendarInfo(req, res) {
        try {
            const { calendarId } = req.params;
            const calendar = await prisma.calendar.findUnique({
                where: { id: parseInt(calendarId) },
                include: {
                    company: true
                }
            });
            if (!calendar) {
                return res.status(404).json({
                    success: false,
                    message: 'Calendario no encontrado'
                });
            }
            res.json({
                success: true,
                data: {
                    ...calendar,
                    workDays: calendar.workDays,
                    holidays: calendar.holidays
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching calendar info:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener información del calendario'
            });
        }
    },
    // Obtener días laborables del mes
    async getWorkingDaysInMonth(req, res) {
        try {
            const { calendarId } = req.params;
            const { year, month } = req.query;
            if (!year || !month) {
                return res.status(400).json({
                    success: false,
                    message: 'Año y mes son requeridos'
                });
            }
            const calendar = await prisma.calendar.findUnique({
                where: { id: parseInt(calendarId) }
            });
            if (!calendar) {
                return res.status(404).json({
                    success: false,
                    message: 'Calendario no encontrado'
                });
            }
            const workingDays = this.calculateWorkingDaysInMonth(parseInt(year), parseInt(month), calendar.workDays, calendar.holidays);
            res.json({
                success: true,
                data: { workingDays }
            });
        }
        catch (error) {
            logger_1.logger.error('Error calculating working days:', error);
            res.status(500).json({
                success: false,
                message: 'Error al calcular días laborables'
            });
        }
    },
    // Verificar si una fecha es laborable
    async checkWorkingDay(req, res) {
        try {
            const { calendarId } = req.params;
            const { date } = req.query;
            if (!date) {
                return res.status(400).json({
                    success: false,
                    message: 'Fecha es requerida'
                });
            }
            const calendar = await prisma.calendar.findUnique({
                where: { id: parseInt(calendarId) }
            });
            if (!calendar) {
                return res.status(404).json({
                    success: false,
                    message: 'Calendario no encontrado'
                });
            }
            const checkDate = new Date(date);
            const isWorking = this.isWorkingDay(checkDate, calendar.workDays, calendar.holidays);
            res.json({
                success: true,
                data: { isWorkingDay: isWorking }
            });
        }
        catch (error) {
            logger_1.logger.error('Error checking working day:', error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar día laborable'
            });
        }
    },
    // Añadir día festivo
    async addHoliday(req, res) {
        try {
            const { calendarId } = req.params;
            const { date, name } = req.body;
            if (!date || !name) {
                return res.status(400).json({
                    success: false,
                    message: 'Fecha y nombre son requeridos'
                });
            }
            const calendar = await prisma.calendar.findUnique({
                where: { id: parseInt(calendarId) }
            });
            if (!calendar) {
                return res.status(404).json({
                    success: false,
                    message: 'Calendario no encontrado'
                });
            }
            const holidays = calendar.holidays;
            const newHoliday = { date, name };
            // Verificar si ya existe
            const existingHoliday = holidays.find(h => h.date === date);
            if (existingHoliday) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un día festivo en esa fecha'
                });
            }
            holidays.push(newHoliday);
            const updatedCalendar = await prisma.calendar.update({
                where: { id: parseInt(calendarId) },
                data: { holidays }
            });
            logger_1.logger.info(`Holiday added to calendar ${calendarId}: ${name}`);
            res.status(201).json({
                success: true,
                data: updatedCalendar
            });
        }
        catch (error) {
            logger_1.logger.error('Error adding holiday:', error);
            res.status(500).json({
                success: false,
                message: 'Error al añadir día festivo'
            });
        }
    },
    // Actualizar días laborables
    async updateWorkDays(req, res) {
        try {
            const { calendarId } = req.params;
            const { workDays } = req.body;
            if (!workDays || !Array.isArray(workDays)) {
                return res.status(400).json({
                    success: false,
                    message: 'Días laborables son requeridos y deben ser un array'
                });
            }
            const calendar = await prisma.calendar.update({
                where: { id: parseInt(calendarId) },
                data: { workDays }
            });
            logger_1.logger.info(`Work days updated for calendar ${calendarId}`);
            res.json({
                success: true,
                data: calendar
            });
        }
        catch (error) {
            logger_1.logger.error('Error updating work days:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar días laborables'
            });
        }
    },
    // Eliminar día festivo
    async removeHoliday(req, res) {
        try {
            const { calendarId } = req.params;
            const { date } = req.body;
            if (!date) {
                return res.status(400).json({
                    success: false,
                    message: 'Fecha es requerida'
                });
            }
            const calendar = await prisma.calendar.findUnique({
                where: { id: parseInt(calendarId) }
            });
            if (!calendar) {
                return res.status(404).json({
                    success: false,
                    message: 'Calendario no encontrado'
                });
            }
            const holidays = calendar.holidays;
            const filteredHolidays = holidays.filter(h => h.date !== date);
            if (holidays.length === filteredHolidays.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Día festivo no encontrado'
                });
            }
            const updatedCalendar = await prisma.calendar.update({
                where: { id: parseInt(calendarId) },
                data: { holidays: filteredHolidays }
            });
            logger_1.logger.info(`Holiday removed from calendar ${calendarId}: ${date}`);
            res.json({
                success: true,
                data: updatedCalendar
            });
        }
        catch (error) {
            logger_1.logger.error('Error removing holiday:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar día festivo'
            });
        }
    },
    // Obtener estadísticas del calendario
    async getCalendarStats(req, res) {
        try {
            const { calendarId } = req.params;
            const { year } = req.query;
            const calendar = await prisma.calendar.findUnique({
                where: { id: parseInt(calendarId) },
                include: {
                    company: true
                }
            });
            if (!calendar) {
                return res.status(404).json({
                    success: false,
                    message: 'Calendario no encontrado'
                });
            }
            const currentYear = year ? parseInt(year) : new Date().getFullYear();
            const holidays = calendar.holidays;
            const workDays = calendar.workDays;
            // Calcular estadísticas del año
            const yearStats = {
                totalDays: this.getDaysInYear(currentYear),
                workingDays: this.calculateWorkingDaysInYear(currentYear, workDays, holidays),
                holidays: holidays.filter(h => new Date(h.date).getFullYear() === currentYear).length,
                weekends: this.calculateWeekendsInYear(currentYear, workDays)
            };
            res.json({
                success: true,
                data: {
                    calendar,
                    stats: yearStats
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error getting calendar stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas del calendario'
            });
        }
    },
    // Métodos auxiliares para cálculos de calendario
    calculateWorkingDaysInMonth(year, month, workDays, holidays) {
        let workingDays = 0;
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            if (this.isWorkingDay(date, workDays, holidays)) {
                workingDays++;
            }
        }
        return workingDays;
    },
    calculateWorkingDaysInYear(year, workDays, holidays) {
        let totalWorkingDays = 0;
        for (let month = 1; month <= 12; month++) {
            totalWorkingDays += this.calculateWorkingDaysInMonth(year, month, workDays, holidays);
        }
        return totalWorkingDays;
    },
    isWorkingDay(date, workDays, holidays) {
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0];
        // Verificar si es día laborable
        if (!workDays.includes(dayOfWeek)) {
            return false;
        }
        // Verificar si es día festivo
        const isHoliday = holidays.some(h => h.date === dateStr);
        return !isHoliday;
    },
    getDaysInYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
    },
    calculateWeekendsInYear(year, workDays) {
        let weekends = 0;
        const totalDays = this.getDaysInYear(year);
        for (let day = 0; day < totalDays; day++) {
            const date = new Date(year, 0, day + 1);
            const dayOfWeek = date.getDay();
            if (!workDays.includes(dayOfWeek)) {
                weekends++;
            }
        }
        return weekends;
    }
};
//# sourceMappingURL=calendarController.js.map