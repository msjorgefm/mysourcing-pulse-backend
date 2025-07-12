"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationService = void 0;
const client_1 = require("@prisma/client");
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const emailService_1 = require("./emailService");
const prisma = new client_1.PrismaClient();
class InvitationService {
    static async createAndSendInvitation(companyId, email, companyName) {
        try {
            // Generar token único
            const token = crypto_1.default.randomBytes(32).toString('hex');
            // Calcular fecha de expiración
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + config_1.config.invitation.expiresInHours);
            // Crear token en la base de datos
            await prisma.invitationToken.create({
                data: {
                    token,
                    email,
                    companyId,
                    expiresAt,
                },
            });
            // Generar enlace de invitación
            const invitationLink = `${config_1.config.frontend.url}/setup-account?token=${token}`;
            // Enviar correo de invitación
            const emailSent = await emailService_1.emailService.sendInvitationEmail(email, companyName, invitationLink);
            if (emailSent) {
                console.log(`✅ Invitation sent to ${email} for company ${companyName}`);
            }
            // En desarrollo, mostrar el link en consola
            if (config_1.config.env === 'development') {
                console.log('🔗 Link de invitación (desarrollo):');
                console.log(`   ${invitationLink}`);
                console.log('   Token expira en:', config_1.config.invitation.expiresInHours, 'horas');
            }
        }
        catch (error) {
            console.error('Error creating and sending invitation:', error);
            throw new Error('Failed to create and send invitation');
        }
    }
    static async validateToken(token) {
        try {
            const invitationToken = await prisma.invitationToken.findUnique({
                where: { token },
                include: { company: true },
            });
            if (!invitationToken) {
                return { valid: false };
            }
            if (invitationToken.used) {
                return { valid: false };
            }
            if (new Date() > invitationToken.expiresAt) {
                return { valid: false };
            }
            return {
                valid: true,
                companyId: invitationToken.companyId,
                email: invitationToken.email,
            };
        }
        catch (error) {
            console.error('Error validating token:', error);
            return { valid: false };
        }
    }
    static async markTokenAsUsed(token) {
        await prisma.invitationToken.update({
            where: { token },
            data: {
                used: true,
                usedAt: new Date(),
            },
        });
    }
    static async getInvitationDetails(token) {
        const invitationToken = await prisma.invitationToken.findUnique({
            where: { token },
            include: {
                company: {
                    select: {
                        id: true,
                        name: true,
                        rfc: true,
                    },
                },
            },
        });
        if (!invitationToken || invitationToken.used || new Date() > invitationToken.expiresAt) {
            return null;
        }
        return {
            email: invitationToken.email,
            company: invitationToken.company,
        };
    }
    static async getFullInvitationDetails(token) {
        const invitationToken = await prisma.invitationToken.findUnique({
            where: { token },
            include: {
                company: true
            }
        });
        if (!invitationToken || invitationToken.used || new Date() > invitationToken.expiresAt) {
            return null;
        }
        return invitationToken;
    }
    static async createDepartmentHeadInvitation(companyId, email, departmentId) {
        try {
            // Generar token único
            const token = crypto_1.default.randomBytes(32).toString('hex');
            // Calcular fecha de expiración
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + config_1.config.invitation.expiresInHours);
            // Obtener información de la empresa y departamento
            const company = await prisma.company.findUnique({
                where: { id: companyId },
                select: { name: true }
            });
            const department = await prisma.departamento.findUnique({
                where: { id: departmentId },
                select: { nombre: true }
            });
            if (!company || !department) {
                throw new Error('Empresa o departamento no encontrado');
            }
            // Crear token en la base de datos con información adicional
            const invitationToken = await prisma.invitationToken.create({
                data: {
                    token,
                    email,
                    companyId,
                    expiresAt,
                    metadata: {
                        role: 'DEPARTMENT_HEAD',
                        departmentId: departmentId,
                        departmentName: department.nombre
                    }
                },
            });
            // Generar enlace de invitación
            const invitationLink = `${config_1.config.frontend.url}/setup-account?token=${token}&role=department_head`;
            // Enviar correo de invitación
            const emailSent = await emailService_1.emailService.sendDepartmentHeadInvitationEmail(email, company.name, department.nombre, invitationLink);
            if (emailSent) {
                console.log(`✅ Department head invitation sent to ${email} for department ${department.nombre} at ${company.name}`);
            }
            // En desarrollo, mostrar el link en consola
            if (config_1.config.env === 'development') {
                console.log('🔗 Link de invitación para jefe de departamento (desarrollo):');
                console.log(`   ${invitationLink}`);
                console.log('   Token expira en:', config_1.config.invitation.expiresInHours, 'horas');
            }
            return invitationToken;
        }
        catch (error) {
            console.error('Error creating department head invitation:', error);
            throw error;
        }
    }
    static async resendInvitation(companyId) {
        try {
            // Buscar la invitación más reciente para esta empresa
            const latestInvitation = await prisma.invitationToken.findFirst({
                where: { companyId },
                orderBy: { createdAt: 'desc' },
                include: { company: true }
            });
            if (!latestInvitation) {
                return {
                    sent: false,
                    message: 'No se encontró ninguna invitación previa para esta empresa'
                };
            }
            // Verificar si el token está activo y no ha sido usado
            const now = new Date();
            console.log('Token validation:', {
                token: latestInvitation.token,
                used: latestInvitation.used,
                expiresAt: latestInvitation.expiresAt,
                now: now,
                isExpired: now >= latestInvitation.expiresAt
            });
            // Por ahora, permitir reenviar siempre para pruebas
            // TODO: Descomentar esta validación en producción
            /*
            if (!latestInvitation.used && now < latestInvitation.expiresAt) {
              return {
                sent: false,
                message: 'La invitación actual sigue activa. El enlace enviado anteriormente aún es válido.'
              };
            }
            */
            // Verificar si ya existe un usuario configurado para esta empresa
            const existingUser = await prisma.user.findFirst({
                where: {
                    companyId,
                    role: 'CLIENT'
                }
            });
            if (existingUser) {
                return {
                    sent: false,
                    message: 'Ya existe un usuario configurado para esta empresa'
                };
            }
            // Crear y enviar nueva invitación
            await this.createAndSendInvitation(companyId, latestInvitation.email, latestInvitation.company.name);
            return {
                sent: true,
                message: 'Invitación reenviada exitosamente'
            };
        }
        catch (error) {
            console.error('Error resending invitation:', error);
            throw new Error('Error al reenviar la invitación');
        }
    }
}
exports.InvitationService = InvitationService;
//# sourceMappingURL=invitationService.js.map