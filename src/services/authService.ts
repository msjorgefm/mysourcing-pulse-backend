import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginRequest, AuthResponse, User } from '../types';
import type { StringValue } from 'ms';

const prisma = new PrismaClient();

export class AuthService {
  
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { email, password } = credentials;
    
    console.log('🔐 Login attempt for:', email);
    
    // Buscar usuario por email
    const user = await prisma.user.findFirst({
      where: {
        email: email,
        isActive: true
      },
      include: {
        company: true,
        employee: true
      }
    });
    
    if (!user) {
      console.log('❌ User not found:', email);
      throw new Error('Invalid credentials');
    }
    
    if (!user.isActive) {
      console.log('❌ User is inactive:', email);
      throw new Error('Invalid credentials');
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      throw new Error('Invalid credentials');
    }
    
    console.log('✅ Login successful for:', email);
    
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
        name: user.name,
        role: user.role as any,
        companyId: user.companyId || undefined,
        companyName: user.company?.name || undefined,
        employeeId: user.employeeId || undefined,
        isActive: user.isActive
      },
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
    name: string;
    role: string;
    companyId?: number;
    employeeId?: number;
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
      name: user.name,
      role: user.role as any,
      companyId: user.companyId || undefined,
      employeeId: user.employeeId || undefined,
      isActive: user.isActive
    };
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
}
