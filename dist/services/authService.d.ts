import { LoginRequest, AuthResponse, User } from '../types';
export declare class AuthService {
    static login(credentials: LoginRequest): Promise<AuthResponse>;
    static refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    static logout(refreshToken: string): Promise<void>;
    static createUser(userData: {
        email: string;
        password: string;
        name: string;
        role: string;
        companyId?: number;
        employeeId?: number;
    }): Promise<User>;
    private static generateAccessToken;
    private static generateRefreshToken;
}
//# sourceMappingURL=authService.d.ts.map