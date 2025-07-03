"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/login', async (req, res, next) => {
    try {
        await authController_1.AuthController.login(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.post('/refresh', async (req, res, next) => {
    try {
        await authController_1.AuthController.refreshToken(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.post('/logout', async (req, res, next) => {
    try {
        await authController_1.AuthController.logout(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.post('/register', async (req, res, next) => {
    try {
        await authController_1.AuthController.register(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.get('/profile', auth_1.authenticate, async (req, res, next) => {
    try {
        await authController_1.AuthController.getProfile(req, res);
        // Do not return anything from the handler
        return;
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map