export interface User {
  id: number;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoUrl?: string;
  role: 'OPERATOR' | 'CLIENT' | 'EMPLOYEE' | 'DEPARTMENT_HEAD' | 'ADMIN';
  companyId?: number;
  companyName?: string;
  employeeId?: number;
  workerDetailsId?: number;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}