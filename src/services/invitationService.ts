import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { config } from '../config';
import { emailService } from './emailService';

const prisma = new PrismaClient();

export class InvitationService {
  static async createAndSendInvitation(companyId: number, email: string, companyName: string): Promise<void> {
    try {
      // Generar token único
      const token = crypto.randomBytes(32).toString('hex');
      
      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + config.invitation.expiresInHours);
      
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
      const invitationLink = `${config.frontend.url}/setup-account?token=${token}`;
      
      // Enviar correo de invitación
      const emailSent = await emailService.sendInvitationEmail(email, companyName, invitationLink);
      
      if (emailSent) {
        console.log(`✅ Invitation sent to ${email} for company ${companyName}`);
      }
      
      // En desarrollo, mostrar el link en consola
      if (config.env === 'development') {
        console.log('🔗 Link de invitación (desarrollo):');
        console.log(`   ${invitationLink}`);
        console.log('   Token expira en:', config.invitation.expiresInHours, 'horas');
      }
    } catch (error) {
      console.error('Error creating and sending invitation:', error);
      throw new Error('Failed to create and send invitation');
    }
  }
  
  static async validateToken(token: string): Promise<{ valid: boolean; companyId?: number; email?: string }> {
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
    } catch (error) {
      console.error('Error validating token:', error);
      return { valid: false };
    }
  }
  
  static async markTokenAsUsed(token: string): Promise<void> {
    await prisma.invitationToken.update({
      where: { token },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });
  }
  
  static async getInvitationDetails(token: string) {
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
    console.log('🔍 Invitation details retrieved:', invitationToken);
    return {
      email: invitationToken.email,
      company: invitationToken.company,
      metadata: invitationToken.metadata
    };
  }
  
  static async getFullInvitationDetails(token: string) {
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
  
  static async createDepartmentHeadInvitation(companyId: number, email: string, departmentId: number): Promise<any> {
    try {
      // Generar token único
      const token = crypto.randomBytes(32).toString('hex');
      
      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + config.invitation.expiresInHours);
      
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
      const invitationLink = `${config.frontend.url}/setup-account?token=${token}&role=department_head`;
      
      // Enviar correo de invitación
      const emailSent = await emailService.sendDepartmentHeadInvitationEmail(
        email, 
        company.name,
        department.nombre,
        invitationLink
      );
      
      if (emailSent) {
        console.log(`✅ Department head invitation sent to ${email} for department ${department.nombre} at ${company.name}`);
      }
      
      // En desarrollo, mostrar el link en consola
      if (config.env === 'development') {
        console.log('🔗 Link de invitación para jefe de departamento (desarrollo):');
        console.log(`   ${invitationLink}`);
        console.log('   Token expira en:', config.invitation.expiresInHours, 'horas');
      }
      
      return invitationToken;
    } catch (error) {
      console.error('Error creating department head invitation:', error);
      throw error;
    }
  }
}