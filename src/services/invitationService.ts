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
  
  static async resendInvitation(companyId: number, email?: string): Promise<{ sent: boolean; message: string }> {
    try {
      // Si se proporciona un email específico, usarlo. Si no, buscar el último usado
      let targetEmail = email;
      let companyName = '';
      
      if (!targetEmail) {
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
        
        targetEmail = latestInvitation.email;
        companyName = latestInvitation.company.name;
        
        // Verificar si el token está activo y no ha sido usado
        const now = new Date();
        console.log('Token validation:', {
          token: latestInvitation.token,
          used: latestInvitation.used,
          expiresAt: latestInvitation.expiresAt,
          now: now,
          isExpired: now >= latestInvitation.expiresAt
        });
      } else {
        // Si se proporciona email, obtener datos de la empresa
        const company = await prisma.company.findUnique({
          where: { id: companyId },
          select: { name: true }
        });
        
        if (!company) {
          return {
            sent: false,
            message: 'Empresa no encontrada'
          };
        }
        
        companyName = company.name;
      }
      
      // Verificar si ya existe un usuario con ese email
      const existingUser = await prisma.user.findFirst({
        where: {
          email: targetEmail,
          companyId,
          role: 'CLIENT'
        }
      });
      
      if (existingUser) {
        return {
          sent: false,
          message: `Ya existe un usuario configurado con el email ${targetEmail} para esta empresa`
        };
      }
      
      // Crear y enviar nueva invitación
      await this.createAndSendInvitation(
        companyId,
        targetEmail,
        companyName
      );
      
      return {
        sent: true,
        message: `Invitación enviada exitosamente a ${targetEmail}`
      };
    } catch (error) {
      console.error('Error resending invitation:', error);
      throw new Error('Error al reenviar la invitación');
    }
  }
  
  static async sendAdditionalInvitation(companyId: number, email: string): Promise<{ sent: boolean; message: string }> {
    try {
      // Obtener información de la empresa
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { name: true }
      });
      
      if (!company) {
        return {
          sent: false,
          message: 'Empresa no encontrada'
        };
      }
      
      // Verificar si ya existe un usuario con ese email en cualquier empresa
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        return {
          sent: false,
          message: 'Ya existe un usuario registrado con ese correo electrónico'
        };
      }
      
      // Crear y enviar invitación
      await this.createAndSendInvitation(
        companyId,
        email,
        company.name
      );
      
      return {
        sent: true,
        message: `Invitación enviada exitosamente a ${email}`
      };
    } catch (error) {
      console.error('Error sending additional invitation:', error);
      throw new Error('Error al enviar la invitación adicional');
    }
  }
  
  static async sendOperatorInvitation(email: string, firstName: string, lastName: string, token: string): Promise<boolean> {
    try {
      // Generar enlace de invitación
      const invitationLink = `${config.frontend.url}/setup-account?token=${token}&role=operator`;
      
      // Enviar correo de invitación
      const emailSent = await emailService.sendOperatorInvitationEmail(
        email,
        firstName,
        lastName,
        invitationLink
      );
      
      if (emailSent) {
        console.log(`✅ Operator invitation sent to ${email}`);
      }
      
      // En desarrollo, mostrar el link en consola
      if (config.env === 'development') {
        console.log('🔗 Link de invitación para operador (desarrollo):');
        console.log(`   ${invitationLink}`);
        console.log('   Token expira en: 7 días');
      }
      
      return emailSent;
    } catch (error) {
      console.error('Error sending operator invitation:', error);
      throw error;
    }
  }
}