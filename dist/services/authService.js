"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuthService {
    static async login(credentials) {
        const { email, password } = credentials;
        // Buscar usuario
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                company: true,
                employee: true
            }
        });
        if (!user || !user.isActive) {
            throw new Error('Invalid credentials');
        }
        // Verificar contraseña
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }
        // Generar tokens
        const accessToken = this.generateAccessToken(user.id);
        const refreshToken = this.generateRefreshToken(user.id);
        // Guardar refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
            }
        });
        // Actualizar último login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        });
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyId: user.companyId || undefined,
                employeeId: user.employeeId || undefined,
                isActive: user.isActive
            },
            accessToken,
            refreshToken
        };
    }
    static async refreshToken(refreshToken) {
        const tokenRecord = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new Error('Invalid or expired refresh token');
        }
        if (!tokenRecord.user.isActive) {
            throw new Error('User account is inactive');
        }
        const accessToken = this.generateAccessToken(tokenRecord.userId);
        return { accessToken };
    }
    static async logout(refreshToken) {
        await prisma.refreshToken.deleteMany({
            where: { token: refreshToken }
        });
    }
    static async createUser(userData) {
        const hashedPassword = await bcryptjs_1.default.hash(userData.password, 12);
        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                role: userData.role
            }
        });
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            companyId: user.companyId || undefined,
            employeeId: user.employeeId || undefined,
            isActive: user.isActive
        };
    }
    static generateAccessToken(userId) {
        const secret = process.env.JWT_SECRET;
        const raw = process.env.JWT_EXPIRES_IN ?? '1h';
        const expiresIn = raw;
        return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn } // TS ve ahora un StringValue válido
        );
    }
    static generateRefreshToken(userId) {
        return jsonwebtoken_1.default.sign({ userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map