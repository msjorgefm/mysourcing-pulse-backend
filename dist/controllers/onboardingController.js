"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingController = void 0;
const invitationService_1 = require("../services/invitationService");
const userService_1 = require("../services/userService");
const bcrypt_1 = __importDefault(require("bcrypt"));
const joi_1 = __importDefault(require("joi"));
const client_1 = require("@prisma/client");
class OnboardingController {
    // Validar token de invitación
    static async validateInvitationToken(req, res) {
        try {
            const { token } = req.query;
            if (!token || typeof token !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: 'Token is required'
                });
            }
            const invitationDetails = await invitationService_1.InvitationService.getInvitationDetails(token);
            if (!invitationDetails) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid or expired token'
                });
            }
            res.json({
                success: true,
                data: invitationDetails
            });
        }
        catch (error) {
            console.error('Error validating invitation token:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to validate token'
            });
        }
    }
    // Configurar acceso del cliente
    static async setupClientAccess(req, res) {
        try {
            // Validación del esquema
            const schema = joi_1.default.object({
                token: joi_1.default.string().required(),
                username: joi_1.default.string().min(3).max(50).required(),
                password: joi_1.default.string().min(8).required(),
                confirmPassword: joi_1.default.string().valid(joi_1.default.ref('password')).required(),
                firstName: joi_1.default.string().min(2).max(50).optional(),
                lastName: joi_1.default.string().min(2).max(50).optional(),
                phone: joi_1.default.string().pattern(/^[0-9\-\+\(\)\s]+$/).optional()
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: error.details[0].message
                });
            }
            const { token, username, password, firstName, lastName, phone } = value;
            // Validar token
            const validation = await invitationService_1.InvitationService.validateToken(token);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid or expired token'
                });
            }
            // Verificar si el username ya existe
            const existingUser = await userService_1.UserService.getUserByEmail(username);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'Username already exists'
                });
            }
            // Obtener detalles de la invitación
            const invitationDetails = await invitationService_1.InvitationService.getInvitationDetails(token);
            if (!invitationDetails) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid token'
                });
            }
            // Hashear contraseña
            const hashedPassword = await bcrypt_1.default.hash(password, 10);
            // Obtener detalles completos de la invitación para verificar metadata
            const fullInvitationDetails = await invitationService_1.InvitationService.getFullInvitationDetails(token);
            const metadata = fullInvitationDetails?.metadata;
            // Determinar el rol basado en la metadata
            let userRole = client_1.UserRole.CLIENT; // Rol por defecto
            if (metadata?.role === 'DEPARTMENT_HEAD') {
                userRole = client_1.UserRole.DEPARTMENT_HEAD;
            }
            else if (metadata?.role === 'EMPLOYEE') {
                userRole = client_1.UserRole.EMPLOYEE;
            }
            // Preparar datos del usuario según el rol
            let userData = {
                email: username,
                password: hashedPassword,
                role: userRole,
                companyId: invitationDetails.company.id
            };
            if (userRole === client_1.UserRole.EMPLOYEE && metadata?.employeeId) {
                // Para empleados, solo agregar la referencia al employeeId
                // NO duplicar información personal que ya está en Employee/WorkerDetails
                userData.employeeId = parseInt(metadata.employeeId.toString());
                // Solo usar un nombre genérico para el campo name requerido
                userData.name = username; // Usar el username como name
                // NO agregar firstName, lastName, phone para empleados
            }
            else {
                // Para otros roles (CLIENT, DEPARTMENT_HEAD), sí guardar la información personal
                userData.name = `${firstName} ${lastName}`;
                userData.firstName = firstName || '';
                userData.lastName = lastName || '';
                userData.phone = phone || '';
            }
            // Crear usuario con los datos apropiados
            const newUser = await userService_1.UserService.createUser(userData);
            // Marcar token como usado
            await invitationService_1.InvitationService.markTokenAsUsed(token);
            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    userId: newUser.id,
                    username: newUser.email,
                    companyName: invitationDetails.company.name
                }
            });
        }
        catch (error) {
            console.error('Error setting up client access:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create account'
            });
        }
    }
    // Reenviar invitación
    static async resendInvitation(req, res) {
        try {
            const { companyId } = req.params;
            // Aquí deberías verificar que el usuario que hace la petición es un operador
            // Por ahora lo omitimos para simplificar
            const companyIdNum = parseInt(companyId);
            if (isNaN(companyIdNum)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid company ID'
                });
            }
            // Obtener información de la empresa
            const company = await userService_1.UserService.getCompanyById(companyIdNum);
            if (!company) {
                return res.status(404).json({
                    success: false,
                    error: 'Company not found'
                });
            }
            // Crear y enviar nueva invitación
            await invitationService_1.InvitationService.createAndSendInvitation(companyIdNum, company.email, company.name);
            res.json({
                success: true,
                message: 'Invitation resent successfully'
            });
        }
        catch (error) {
            console.error('Error resending invitation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to resend invitation'
            });
        }
    }
}
exports.OnboardingController = OnboardingController;
//# sourceMappingURL=onboardingController.js.map