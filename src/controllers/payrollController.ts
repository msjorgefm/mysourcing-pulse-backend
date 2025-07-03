import { Request, Response } from 'express';
import { PayrollService } from '../services/payrollService';

interface AuthRequest extends Request {
  user?: any;
}

export class PayrollController {
  
  static async getAllPayrolls(req: AuthRequest, res: Response) {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      const status = req.query.status as string;
      
      // Si es cliente, solo puede ver sus nóminas
      const finalCompanyId = req.user?.role === 'CLIENT' ? req.user.companyId : companyId;
      
      const payrolls = await PayrollService.getAllPayrolls(finalCompanyId, status);
      
      res.json({
        message: 'Payrolls retrieved successfully',
        data: payrolls
      });
    } catch (error: any) {
      console.error('Get payrolls error:', error);
      res.status(500).json({ error: error.message || 'Failed to get payrolls' });
    }
  }
  
  static async getPayrollById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const includeDetails = req.query.details === 'true';
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid payroll ID' });
      }
      
      const payroll = await PayrollService.getPayrollById(id, includeDetails);
      
      // Verificar permisos
      if (req.user?.role === 'CLIENT' && payroll.companyId !== req.user.companyId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json({
        message: 'Payroll retrieved successfully',
        data: payroll
      });
    } catch (error: any) {
      console.error('Get payroll error:', error);
      if (error.message === 'Payroll not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to get payroll' });
    }
  }
  
  static async createPayroll(req: AuthRequest, res: Response) {
    try {
      const payroll = await PayrollService.createPayroll(req.body, req.user!.id);
      
      res.status(201).json({
        message: 'Payroll created successfully',
        data: payroll
      });
    } catch (error: any) {
      console.error('Create payroll error:', error);
      res.status(500).json({ error: error.message || 'Failed to create payroll' });
    }
  }
  
  static async calculatePayroll(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid payroll ID' });
      }
      
      const result = await PayrollService.calculatePayroll(id);
      
      res.json({
        message: 'Payroll calculated successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Calculate payroll error:', error);
      res.status(500).json({ error: error.message || 'Failed to calculate payroll' });
    }
  }
  
  static async sendForAuthorization(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid payroll ID' });
      }
      
      const io = req.app.get('io');
      const result = await PayrollService.sendForAuthorization(id, req.user!.id, io);
      
      res.json({
        message: 'Payroll sent for authorization successfully',
        data: result
      });
    } catch (error: any) {
      console.error('Send for authorization error:', error);
      res.status(500).json({ error: error.message || 'Failed to send for authorization' });
    }
  }
  
  static async authorizePayroll(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { action, comments } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid payroll ID' });
      }
      
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be approve or reject' });
      }
      
      const io = req.app.get('io');
      const result = await PayrollService.authorizePayroll(id, action, comments, req.user!.id, io);
      
      res.json({
        message: `Payroll ${action}d successfully`,
        data: result
      });
    } catch (error: any) {
      console.error('Authorize payroll error:', error);
      res.status(500).json({ error: error.message || 'Failed to authorize payroll' });
    }
  }
  
  static async getPayrollStats(req: AuthRequest, res: Response) {
    try {
      const companyId = req.query.companyId ? parseInt(req.query.companyId as string) : undefined;
      
      // Si es cliente, solo puede ver stats de su empresa
      const finalCompanyId = req.user?.role === 'CLIENT' ? req.user.companyId : companyId;
      
      const stats = await PayrollService.getPayrollStats(finalCompanyId);
      
      res.json({
        message: 'Payroll statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      console.error('Get payroll stats error:', error);
      res.status(500).json({ error: error.message || 'Failed to get payroll statistics' });
    }
  }
}