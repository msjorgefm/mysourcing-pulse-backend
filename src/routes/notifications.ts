import express from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', NotificationController.getNotifications);
router.post('/', async (req, res, next) => {
  try {
    await NotificationController.createNotification(req, res);
  } catch (err) {
    next(err);
  }
});
router.patch('/:id/read', async (req, res, next) => {
  try {
    await NotificationController.markAsRead(req, res);
  } catch (err) {
    next(err);
  }
});
router.patch('/mark-all-read', async (req, res, next) => {
  try {
    await NotificationController.markAllAsRead(req, res);
  } catch (err) {
    next(err);
  }
});
router.delete('/:id', async (req, res, next) => {
  try {
    await NotificationController.deleteNotification(req, res);
  } catch (err) {
    next(err);
  }
});

export default router;