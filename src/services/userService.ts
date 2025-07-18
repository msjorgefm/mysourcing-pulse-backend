import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  password: string;
  username: string;
  phone?: string;
  role: UserRole;
  companyId?: number;
  workerDetailsId?: number;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  username?: string;
  phone?: string;
  photoUrl?: string;
  role?: UserRole;
  isActive?: boolean;
}

export class UserService {
  
  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
        workerDetails: true
      }
    });
  }
  
  static async getUserById(id: number, includePassword: boolean = false) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        workerDetails: true
      }
    });
    
    if (user && !includePassword) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    
    return user;
  }
  
  static async getUserByIdWithPassword(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        workerDetails: true
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
        username: data.username,
        phone: data.phone,
        role: data.role,
        companyId: data.companyId,
        workerDetailsId: data.workerDetailsId,
        isActive: true
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        isActive: true,
        companyId: true,
        workerDetailsId: true,
        createdAt: true
      }
    });
  }
  
  static async updateUser(id: number, data: UpdateUserData) {
    const updateData: any = { ...data };
    
    // Si se está actualizando la contraseña, hashearla
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }
    
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        photoUrl: true,
        role: true,
        isActive: true,
        companyId: true,
        workerDetailsId: true,
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
        username: true,
        role: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: {
        username: 'asc'
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
        username: true,
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
  
  static async getUserByEmployeeId(employeeId: number) {
    const user = await prisma.user.findFirst({
      where: {
        workerDetailsId: employeeId
      },
      include: {
        workerDetails: true,
        company: true
      }
    });
    
    return user;
  }
  
  static async getCompanyById(companyId: number) {
    return await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        generalInfo: {
          select: {
            rfc: true
          }
        }
      }
    });
  }
}