"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
class UserService {
    static async getUserByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
            include: {
                company: true,
                employee: true
            }
        });
    }
    static async getUserById(id) {
        return await prisma.user.findUnique({
            where: { id },
            include: {
                company: true,
                employee: true
            }
        });
    }
    static async createUser(data) {
        // Verificar si el email ya existe
        const existingUser = await this.getUserByEmail(data.email);
        if (existingUser) {
            throw new Error('Email already exists');
        }
        return await prisma.user.create({
            data: {
                email: data.email,
                password: data.password, // Ya debe venir hasheada
                name: data.name,
                role: data.role,
                companyId: data.companyId,
                employeeId: data.employeeId,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                companyId: true,
                employeeId: true,
                createdAt: true
            }
        });
    }
    static async updateUser(id, data) {
        const updateData = { ...data };
        // Si se está actualizando la contraseña, hashearla
        if (data.password) {
            updateData.password = await bcrypt_1.default.hash(data.password, 10);
        }
        return await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                companyId: true,
                employeeId: true,
                updatedAt: true
            }
        });
    }
    static async deleteUser(id) {
        // Soft delete - solo desactivar
        return await prisma.user.update({
            where: { id },
            data: { isActive: false }
        });
    }
    static async getUsersByCompany(companyId) {
        return await prisma.user.findMany({
            where: {
                companyId,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                lastLoginAt: true
            },
            orderBy: {
                name: 'asc'
            }
        });
    }
    static async getUsersByRole(role) {
        return await prisma.user.findMany({
            where: {
                role,
                isActive: true
            },
            select: {
                id: true,
                email: true,
                name: true,
                companyId: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    static async updateLastLogin(userId) {
        return await prisma.user.update({
            where: { id: userId },
            data: { lastLoginAt: new Date() }
        });
    }
    static async checkUsernameAvailable(username, excludeUserId) {
        const existingUser = await prisma.user.findFirst({
            where: {
                email: username,
                ...(excludeUserId && { id: { not: excludeUserId } })
            }
        });
        return !existingUser;
    }
    static async getCompanyById(companyId) {
        return await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                id: true,
                name: true,
                email: true,
                rfc: true,
                status: true
            }
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map