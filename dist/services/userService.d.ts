import { UserRole } from '@prisma/client';
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
export declare class UserService {
    static getUserByEmail(email: string): Promise<({
        company: {
            email: string;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            rfc: string;
            legalName: string;
            address: string;
            phone: string | null;
            status: import(".prisma/client").$Enums.CompanyStatus;
            employeesCount: number;
        } | null;
        employee: {
            email: string | null;
            id: number;
            name: string;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            rfc: string;
            address: string | null;
            phone: string | null;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            employeeNumber: string;
            position: string;
            department: string;
            hireDate: Date;
            contractType: import(".prisma/client").$Enums.ContractType;
            workSchedule: string | null;
            baseSalary: import("@prisma/client/runtime/library").Decimal;
            dateOfBirth: Date | null;
            emergencyContact: string | null;
            bankName: string | null;
            bankAccount: string | null;
            clabe: string | null;
            taxRegime: string | null;
        } | null;
    } & {
        email: string;
        password: string;
        id: number;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        employeeId: number | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
    }) | null>;
    static getUserById(id: number): Promise<({
        company: {
            email: string;
            id: number;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            rfc: string;
            legalName: string;
            address: string;
            phone: string | null;
            status: import(".prisma/client").$Enums.CompanyStatus;
            employeesCount: number;
        } | null;
        employee: {
            email: string | null;
            id: number;
            name: string;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            rfc: string;
            address: string | null;
            phone: string | null;
            status: import(".prisma/client").$Enums.EmployeeStatus;
            employeeNumber: string;
            position: string;
            department: string;
            hireDate: Date;
            contractType: import(".prisma/client").$Enums.ContractType;
            workSchedule: string | null;
            baseSalary: import("@prisma/client/runtime/library").Decimal;
            dateOfBirth: Date | null;
            emergencyContact: string | null;
            bankName: string | null;
            bankAccount: string | null;
            clabe: string | null;
            taxRegime: string | null;
        } | null;
    } & {
        email: string;
        password: string;
        id: number;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        employeeId: number | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
    }) | null>;
    static createUser(data: CreateUserData): Promise<{
        email: string;
        id: number;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        employeeId: number | null;
        createdAt: Date;
    }>;
    static updateUser(id: number, data: UpdateUserData): Promise<{
        email: string;
        id: number;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        employeeId: number | null;
        updatedAt: Date;
    }>;
    static deleteUser(id: number): Promise<{
        email: string;
        password: string;
        id: number;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        employeeId: number | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
    }>;
    static getUsersByCompany(companyId: number): Promise<{
        email: string;
        id: number;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        lastLoginAt: Date | null;
    }[]>;
    static getUsersByRole(role: UserRole): Promise<{
        email: string;
        id: number;
        name: string;
        companyId: number | null;
        createdAt: Date;
    }[]>;
    static updateLastLogin(userId: number): Promise<{
        email: string;
        password: string;
        id: number;
        name: string;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        employeeId: number | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
    }>;
    static checkUsernameAvailable(username: string, excludeUserId?: number): Promise<boolean>;
    static getCompanyById(companyId: number): Promise<{
        email: string;
        id: number;
        name: string;
        rfc: string;
        status: import(".prisma/client").$Enums.CompanyStatus;
    } | null>;
}
//# sourceMappingURL=userService.d.ts.map