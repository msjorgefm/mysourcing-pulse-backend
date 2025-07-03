"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const authValidation_1 = require("../validations/authValidation");
class AuthController {
    static async login(req, res) {
        try {
            const { error } = authValidation_1.loginValidation.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const result = await authService_1.AuthService.login(req.body);
            res.json({
                message: 'Login successful',
                data: result
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(401).json({ error: error.message || 'Login failed' });
        }
    }
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({ error: 'Refresh token required' });
            }
            const result = await authService_1.AuthService.refreshToken(refreshToken);
            res.json({
                message: 'Token refreshed successfully',
                data: result
            });
        }
        catch (error) {
            console.error('Refresh token error:', error);
            res.status(401).json({ error: error.message || 'Token refresh failed' });
        }
    }
    static async logout(req, res) {
        try {
            const { refreshToken } = req.body;
            if (refreshToken) {
                await authService_1.AuthService.logout(refreshToken);
            }
            res.json({ message: 'Logout successful' });
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({ error: 'Logout failed' });
        }
    }
    static async register(req, res) {
        try {
            const { error } = authValidation_1.registerValidation.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            const user = await authService_1.AuthService.createUser(req.body);
            res.status(201).json({
                message: 'User created successfully',
                data: user
            });
        }
        catch (error) {
            console.error('Register error:', error);
            if (error.code === 'P2002') {
                return res.status(409).json({ error: 'Email already exists' });
            }
            res.status(500).json({ error: error.message || 'Registration failed' });
        }
    }
    static async getProfile(req, res) {
        try {
            res.json({
                message: 'Profile retrieved successfully',
                data: req.user
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ error: 'Failed to get profile' });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map