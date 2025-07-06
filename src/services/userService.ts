import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyId?: number;
  employeeId?: number;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export class UserService {
  
  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
        employee: true
      }
    });
  }
  
  static async getUserById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        employee: true
      }
    });
  }
  
  static async createUser(data: CreateUserData) {
    // Verificar si el email ya existe
    const existingUser = await this.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }
    
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.password, // Ya debe venir hasheada
        name: data.name,
        role: data.role,
        companyId: data.companyId,
        employeeId: data.employeeId,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        companyId: true,
        employeeId: true,
        createdAt: true
      }
    });
  }
  
  static async updateUser(id: number, data: UpdateUserData) {
    const updateData: any = { ...data };
    
    // Si se está actualizando la contraseña, hashearla
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }
    
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        companyId: true,
        employeeId: true,
        updatedAt: true
      }
    });
  }
  
  static async deleteUser(id: number) {
    // Soft delete - solo desactivar
    return await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }
  
  static async getUsersByCompany(companyId: number) {
    return await prisma.user.findMany({
      where: {
        companyId,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
  
  static async getUsersByRole(role: UserRole) {
    return await prisma.user.findMany({
      where: {
        role,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        name: true,
        companyId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
  
  static async updateLastLogin(userId: number) {
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }
  
  static async checkUsernameAvailable(username: string, excludeUserId?: number) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: username,
        ...(excludeUserId && { id: { not: excludeUserId } })
      }
    });
    
    return !existingUser;
  }
  
  static async getCompanyById(companyId: number) {
    return await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        rfc: true,
        status: true
      }
    });
  }
}