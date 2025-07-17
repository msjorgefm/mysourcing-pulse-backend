import { Request, Response } from 'express';
import { CompanyService } from '../services/companyService';
import { createCompanyValidation, updateCompanyValidation } from '../validations/companyValidation';
import { PrismaClient } from '@prisma/client';

interface AuthRequest extends Request {
  user?: any;
}
const prisma = new PrismaClient();

export class CompanyController {
  
  static async getAllCompanies(req: AuthRequest, res: Response) {
    try {
      const currentUser = req.user;
      const userRole = currentUser?.role;
      const userId = currentUser?.id;
      
      let companies;
      
      if (userRole === 'OPERATOR') {
        // Si es operador, obtener solo las empresas asignadas a ese operador
        companies = await CompanyService.getCompaniesByOperator(userId);
      } else if (userRole === 'ADMIN') {
        // Si es admin, obtener las empresas de los operadores que gestiona
        companies = await CompanyService.getCompaniesManagedByAdmin(userId);
      } else {
        // Para otros roles, obtener todas las empresas
        companies = await CompanyService.getAllCompanies();
      }
      
      res.json({
        message: 'Companies retrieved successfully',
        data: companies,
        success: true
      });
    } catch (error: any) {
      console.error('Get companies error:', error);
      res.status(500).json({ error: error.message || 'Failed to get companies' });
    }
  }
  
  static async getCompanyById(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const includeDetails = req.query.details === 'true';
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }
      
      const company = await CompanyService.getCompanyById(id, includeDetails);
      
      res.json({
        message: 'Company retrieved successfully',
        data: company
      });
    } catch (error: any) {
      console.error('Get company error:', error);
      if (error.message === 'Company not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to get company' });
    }
  }
  
  static async createCompany(req: AuthRequest, res: Response) {
    try {
      const { error } = createCompanyValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      
      // Obtener el usuario actual y su rol
      const currentUser = req.user;
      const userId = currentUser?.id;
      const userRole = currentUser?.role;

      const user = await prisma.user.findFirst({ where: { id: userId}});
      let adminId: number | undefined;

      if (user) {
        if (userRole === 'OPERATOR') {
          adminId = user.managedByAdminId ?? undefined;
        }
      }
      
      // Determinar el admin que gestionará la empresa
      if (userRole === 'ADMIN') {
        adminId = userId;
      }
      // Crear la empresa con el admin asignado
      const company = await CompanyService.createCompany(req.body, adminId); // adminId is now of type number | undefined
      
      // Si el usuario es operador, asignarlo automáticamente a la empresa creada
      if (userRole === 'OPERATOR' && userId) {
        await CompanyService.assignOperatorToCompany(company.id, userId, userId);
      }
      
      res.status(201).json({
        message: 'Company created successfully',
        data: company
      });
    } catch (error: any) {
      console.error('Create company error:', error);
      if (error.message === 'RFC already exists') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to create company' });
    }
  }
  
  static async updateCompany(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }
      
      const { error } = updateCompanyValidation.validate(req.body);
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      
      const company = await CompanyService.updateCompany({ id, ...req.body });
      
      res.json({
        message: 'Company updated successfully',
        data: company
      });
    } catch (error: any) {
      console.error('Update company error:', error);
      if (error.message === 'Company not found') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'RFC already exists') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to update company' });
    }
  }
  
  static async deleteCompany(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }
      
      const result = await CompanyService.deleteCompany(id);
      
      res.json({
        message: result.message,
        data: { companyId: result.companyId }
      });
    } catch (error: any) {
      console.error('Delete company error:', error);
      if (error.message.includes('Cannot delete')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to delete company' });
    }
  }
  
  static async getCompanyStats(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }
      
      const stats = await CompanyService.getCompanyStats(id);
      
      res.json({
        message: 'Company statistics retrieved successfully',
        data: stats
      });
    } catch (error: any) {
      console.error('Get company stats error:', error);
      if (error.message === 'Company not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to get company statistics' });
    }
  }
  
  static async getCompanyDepartments(companyId: number) {
    try {
      return await CompanyService.getCompanyDepartments(companyId);
    } catch (error: any) {
      console.error('Get company departments error:', error);
      throw error;
    }
  }
  
  static async inviteDepartmentHead(companyId: number, email: string, departmentId: number) {
    try {
      return await CompanyService.inviteDepartmentHead(companyId, email, departmentId);
    } catch (error: any) {
      console.error('Invite department head error:', error);
      throw error;
    }
  }
  
  static async resendInvitation(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }
      
      const result = await CompanyService.resendInvitation(id);
      
      if (result.sent) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error: any) {
      console.error('Resend invitation error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to resend invitation' 
      });
    }
  }
  
  static async sendAdditionalInvitation(req: AuthRequest, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { email } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      const result = await CompanyService.sendAdditionalInvitation(id, email);
      
      if (result.sent) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error: any) {
      console.error('Send additional invitation error:', error);
      res.status(500).json({ 
        success: false,
        error: error.message || 'Failed to send additional invitation' 
      });
    }
  }
}