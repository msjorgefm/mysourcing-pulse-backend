"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get('/', notificationController_1.NotificationController.getNotifications);
router.patch('/:id/read', async (req, res, next) => {
    try {
        await notificationController_1.NotificationController.markAsRead(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.patch('/mark-all-read', async (req, res, next) => {
    try {
        await notificationController_1.NotificationController.markAllAsRead(req, res);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        await notificationController_1.NotificationController.deleteNotification(req, res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map