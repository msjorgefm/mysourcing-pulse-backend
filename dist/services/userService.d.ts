import { UserRole } from '@prisma/client';
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
export declare class UserService {
    static getUserByEmail(email: string): Promise<({
        company: {
            email: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            name: string;
            rfc: string;
            legalName: string;
            address: string;
            status: import(".prisma/client").$Enums.CompanyStatus;
            employeesCount: number;
        } | null;
        workerDetails: {
            id: number;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            rfc: string;
            numeroTrabajador: number;
            nombres: string;
            apellidoPaterno: string;
            apellidoMaterno: string | null;
            fechaNacimiento: Date;
            sexo: import(".prisma/client").$Enums.SexoTrabajador | null;
            nacionalidad: import(".prisma/client").$Enums.NacionalidadTrabajador | null;
            estadoCivil: import(".prisma/client").$Enums.EstadoCivilTrabajador;
            curp: string;
            nss: string;
            umf: number | null;
        } | null;
    } & {
        email: string;
        password: string;
        id: number;
        username: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        workerDetailsId: number | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        phone: string | null;
        photoUrl: string | null;
    }) | null>;
    static getUserById(id: number, includePassword?: boolean): Promise<{
        company: {
            email: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            name: string;
            rfc: string;
            legalName: string;
            address: string;
            status: import(".prisma/client").$Enums.CompanyStatus;
            employeesCount: number;
        } | null;
        workerDetails: {
            id: number;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            rfc: string;
            numeroTrabajador: number;
            nombres: string;
            apellidoPaterno: string;
            apellidoMaterno: string | null;
            fechaNacimiento: Date;
            sexo: import(".prisma/client").$Enums.SexoTrabajador | null;
            nacionalidad: import(".prisma/client").$Enums.NacionalidadTrabajador | null;
            estadoCivil: import(".prisma/client").$Enums.EstadoCivilTrabajador;
            curp: string;
            nss: string;
            umf: number | null;
        } | null;
        email: string;
        id: number;
        username: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        workerDetailsId: number | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        phone: string | null;
        photoUrl: string | null;
    } | null>;
    static getUserByIdWithPassword(id: number): Promise<({
        company: {
            email: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            name: string;
            rfc: string;
            legalName: string;
            address: string;
            status: import(".prisma/client").$Enums.CompanyStatus;
            employeesCount: number;
        } | null;
        workerDetails: {
            id: number;
            companyId: number;
            createdAt: Date;
            updatedAt: Date;
            rfc: string;
            numeroTrabajador: number;
            nombres: string;
            apellidoPaterno: string;
            apellidoMaterno: string | null;
            fechaNacimiento: Date;
            sexo: import(".prisma/client").$Enums.SexoTrabajador | null;
            nacionalidad: import(".prisma/client").$Enums.NacionalidadTrabajador | null;
            estadoCivil: import(".prisma/client").$Enums.EstadoCivilTrabajador;
            curp: string;
            nss: string;
            umf: number | null;
        } | null;
    } & {
        email: string;
        password: string;
        id: number;
        username: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        workerDetailsId: number | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        phone: string | null;
        photoUrl: string | null;
    }) | null>;
    static createUser(data: CreateUserData): Promise<{
        email: string;
        id: number;
        username: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        workerDetailsId: number | null;
        createdAt: Date;
        phone: string | null;
    }>;
    static updateUser(id: number, data: UpdateUserData): Promise<{
        email: string;
        id: number;
        username: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        workerDetailsId: number | null;
        updatedAt: Date;
        phone: string | null;
        photoUrl: string | null;
    }>;
    static deleteUser(id: number): Promise<{
        email: string;
        password: string;
        id: number;
        username: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        workerDetailsId: number | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        phone: string | null;
        photoUrl: string | null;
    }>;
    static getUsersByCompany(companyId: number): Promise<{
        email: string;
        id: number;
        username: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        lastLoginAt: Date | null;
    }[]>;
    static getUsersByRole(role: UserRole): Promise<{
        email: string;
        id: number;
        username: string | null;
        companyId: number | null;
        createdAt: Date;
    }[]>;
    static updateLastLogin(userId: number): Promise<{
        email: string;
        password: string;
        id: number;
        username: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        companyId: number | null;
        workerDetailsId: number | null;
        createdAt: Date;
        updatedAt: Date;
        lastLoginAt: Date | null;
        phone: string | null;
        photoUrl: string | null;
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