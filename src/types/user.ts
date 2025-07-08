export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  companyId?: number;
  companyName?: string;
  employeeId?: number;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'operator' | 'authorizer' | 'viewer';

export interface AuthToken {
  token: string;
  user: User;
  expiresAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserPermissions {
  canCreatePayroll: boolean;
  canAuthorizePayroll: boolean;
  canViewReports: boolean;
  canManageEmployees: boolean;
  canManageCompanies: boolean;
  canExportData: boolean;
}

export interface Company {
  id: number;
  name: string;
  taxId: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  employeesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: number;
  companyId: number;
  employeeNumber: string;
  name: string;
  position?: string;
  department?: string;
  salary: number;
  hireDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: number;
  userId: number;
  companyId?: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: Date;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}