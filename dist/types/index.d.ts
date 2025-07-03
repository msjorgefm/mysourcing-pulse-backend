export interface User {
    id: number;
    email: string;
    name: string;
    role: 'OPERATOR' | 'CLIENT' | 'EMPLOYEE' | 'ADMIN';
    companyId?: number;
    employeeId?: number;
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
//# sourceMappingURL=index.d.ts.map