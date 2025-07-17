import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginRequest, AuthResponse, User } from '../types';
import type { StringValue } from 'ms';

const prisma = new PrismaClient();

export class AuthService {
  
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { email, password } = credentials;
        
    // Buscar usuario por email o username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ],
        isActive: true
      },
      include: {
        company: true,
        workerDetails: true
      }
    });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    if (!user.isActive) {
      throw new Error('Invalid credentials');
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }
        
    // Generar tokens
    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);
    
    // Guardar refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      }
    });
    
    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.username || user.email,
        username: user.username,
        phone: user.phone || undefined,
        photoUrl: user.photoUrl || undefined,
        role: user.role as any,
        companyId: user.companyId || undefined,
        companyName: user.company?.name || undefined,
        workerDetailsId: user.workerDetailsId || undefined,
        isActive: user.isActive
      } as User,
      accessToken,
      refreshToken
    };
  }
  
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });
    
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }
    
    if (!tokenRecord.user.isActive) {
      throw new Error('User account is inactive');
    }
    
    const accessToken = this.generateAccessToken(tokenRecord.userId);
    
    return { accessToken };
  }
  
  static async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }
  
  static async createUser(userData: {
    email: string;
    password: string;
    username: string;
    role: string;
    companyId?: number;
    workerDetailsId?: number;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        role: userData.role as any
      }
    });
    
    return {
      id: user.id,
      email: user.email,
      name: user.username || user.email,
      username: user.username,
      role: user.role as any,
      companyId: user.companyId || undefined,
      workerDetailsId: user.workerDetailsId || undefined,
      isActive: user.isActive
    } as User;
  }
  
  private static generateAccessToken(userId: number): string {
  const secret = process.env.JWT_SECRET!;
  const raw = process.env.JWT_EXPIRES_IN ?? '1h';
  const expiresIn = raw as StringValue;

  return jwt.sign(
    { userId },
    secret,
    { expiresIn }  // TS ve ahora un StringValue válido
  );
}
  
  private static generateRefreshToken(userId: number): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
  }
  
  static async validateSetupToken(token: string) {
    console.log(`🔍 Validando token: ${token}`);
    
    const user = await prisma.user.findFirst({
      where: {
        setupToken: token,
        setupTokenExpiry: {
          gt: new Date()
        }
      }
    });
    
    if (!user) {
      // Buscar si existe el token pero expiró
      const expiredUser = await prisma.user.findFirst({
        where: { setupToken: token }
      });
      
      if (expiredUser) {
        console.log(`❌ Token expirado. Expiró en: ${expiredUser.setupTokenExpiry}`);
        throw new Error('Token expirado. Solicita un nuevo enlace.');
      }
      
      console.log(`❌ Token no encontrado en la base de datos`);
      throw new Error('Token inválido o expirado');
    }
    
    console.log(`✅ Token válido para usuario: ${user.email}`);
    return user;
  }
  
  static async completeAccountSetup(token: string, username: string, password: string): Promise<AuthResponse> {
    // Validar token
    const user = await this.validateSetupToken(token);
    
    // Verificar que el username no esté en uso
    const existingUser = await prisma.user.findFirst({
      where: {
        email: username,
        id: { not: user.id }
      }
    });
    
    if (existingUser) {
      throw new Error('El nombre de usuario ya está en uso');
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: username, // Actualizamos el email con el username elegido
        password: hashedPassword,
        isActive: true,
        setupToken: null,
        setupTokenExpiry: null,
        lastLoginAt: new Date()
      },
      include: {
        company: true,
        workerDetails: true
      }
    });
    
    // Generar tokens
    const accessToken = this.generateAccessToken(updatedUser.id);
    const refreshToken = this.generateRefreshToken(updatedUser.id);
    
    // Guardar refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: updatedUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    
    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.username || '',
        role: updatedUser.role,
        isActive: updatedUser.isActive
      },
      accessToken,
      refreshToken
    };
  }
}
