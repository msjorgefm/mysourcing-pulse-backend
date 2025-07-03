export declare const INCIDENCE_TYPES: {
    readonly FALTAS: {
        readonly value: "faltas";
        readonly label: "Faltas";
        readonly unit: "días";
        readonly color: "red";
        readonly description: "Días no trabajados (descuento)";
        readonly defaultAmount: 1;
        readonly isDeduction: true;
    };
    readonly VACACIONES: {
        readonly value: "vacaciones";
        readonly label: "Vacaciones";
        readonly unit: "días";
        readonly color: "blue";
        readonly description: "Días de vacaciones (pago normal)";
        readonly defaultAmount: 1;
        readonly isDeduction: false;
    };
    readonly TIEMPO_EXTRA: {
        readonly value: "tiempo_extra";
        readonly label: "Tiempo Extra";
        readonly unit: "horas";
        readonly color: "green";
        readonly description: "Horas extras (pago doble)";
        readonly defaultAmount: 2;
        readonly isDeduction: false;
    };
    readonly PERMISOS: {
        readonly value: "permisos";
        readonly label: "Permisos";
        readonly unit: "días";
        readonly color: "yellow";
        readonly description: "Permisos con/sin goce de sueldo";
        readonly defaultAmount: 1;
        readonly isDeduction: false;
    };
    readonly BONOS: {
        readonly value: "bonos";
        readonly label: "Bonos";
        readonly unit: "cantidad";
        readonly color: "purple";
        readonly description: "Bonificaciones adicionales";
        readonly defaultAmount: 1000;
        readonly isDeduction: false;
    };
    readonly DESCUENTOS: {
        readonly value: "descuentos";
        readonly label: "Descuentos";
        readonly unit: "cantidad";
        readonly color: "orange";
        readonly description: "Descuentos varios";
        readonly defaultAmount: 500;
        readonly isDeduction: true;
    };
};
export declare const PAYROLL_STATUS: {
    readonly DRAFT: {
        readonly value: "draft";
        readonly label: "Borrador";
        readonly color: "gray";
        readonly description: "Nómina en edición";
    };
    readonly IN_PROGRESS: {
        readonly value: "in_progress";
        readonly label: "En Proceso";
        readonly color: "blue";
        readonly description: "Calculando nómina";
    };
    readonly PENDING_AUTHORIZATION: {
        readonly value: "pending_authorization";
        readonly label: "Pendiente de Autorización";
        readonly color: "yellow";
        readonly description: "Esperando autorización";
    };
    readonly AUTHORIZED: {
        readonly value: "authorized";
        readonly label: "Autorizada";
        readonly color: "green";
        readonly description: "Nómina autorizada";
    };
    readonly PAID: {
        readonly value: "paid";
        readonly label: "Pagada";
        readonly color: "green";
        readonly description: "Nómina pagada";
    };
    readonly REJECTED: {
        readonly value: "rejected";
        readonly label: "Rechazada";
        readonly color: "red";
        readonly description: "Nómina rechazada";
    };
};
export declare const USER_ROLES: {
    readonly ADMIN: {
        readonly value: "admin";
        readonly label: "Administrador";
        readonly permissions: readonly ["all"];
    };
    readonly OPERATOR: {
        readonly value: "operator";
        readonly label: "Operador";
        readonly permissions: readonly ["create_payroll", "manage_employees", "view_reports"];
    };
    readonly AUTHORIZER: {
        readonly value: "authorizer";
        readonly label: "Autorizador";
        readonly permissions: readonly ["authorize_payroll", "view_reports"];
    };
    readonly VIEWER: {
        readonly value: "viewer";
        readonly label: "Consultor";
        readonly permissions: readonly ["view_reports"];
    };
};
export declare const NOTIFICATION_TYPES: {
    readonly INFO: {
        readonly value: "info";
        readonly label: "Información";
        readonly color: "blue";
        readonly icon: "info";
    };
    readonly WARNING: {
        readonly value: "warning";
        readonly label: "Advertencia";
        readonly color: "yellow";
        readonly icon: "warning";
    };
    readonly ERROR: {
        readonly value: "error";
        readonly label: "Error";
        readonly color: "red";
        readonly icon: "error";
    };
    readonly SUCCESS: {
        readonly value: "success";
        readonly label: "Éxito";
        readonly color: "green";
        readonly icon: "success";
    };
};
export declare const PAYROLL_FREQUENCIES: {
    readonly QUINCENAL: {
        readonly value: "quincenal";
        readonly label: "Quincenal";
        readonly days: 15;
        readonly periodsPerYear: 24;
    };
    readonly MENSUAL: {
        readonly value: "mensual";
        readonly label: "Mensual";
        readonly days: 30;
        readonly periodsPerYear: 12;
    };
};
export declare const PAGINATION: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 10;
    readonly MAX_LIMIT: 100;
    readonly VALID_LIMITS: readonly [10, 25, 50, 100];
};
export declare const VALIDATION_LIMITS: {
    readonly EMPLOYEE_NAME_MIN: 2;
    readonly EMPLOYEE_NAME_MAX: 100;
    readonly EMPLOYEE_NUMBER_MAX: 50;
    readonly COMPANY_NAME_MIN: 2;
    readonly COMPANY_NAME_MAX: 100;
    readonly COMMENTS_MAX: 500;
    readonly PASSWORD_MIN: 8;
    readonly MAX_OVERTIME_HOURS: 12;
    readonly MAX_VACATION_DAYS: 30;
    readonly MAX_AMOUNT: 999999.99;
};
export declare const DATE_FORMATS: {
    readonly API: "YYYY-MM-DD";
    readonly DISPLAY: "DD/MM/YYYY";
    readonly DISPLAY_WITH_TIME: "DD/MM/YYYY HH:mm";
    readonly ISO: "YYYY-MM-DDTHH:mm:ss.sssZ";
};
export declare const ERROR_MESSAGES: {
    readonly UNAUTHORIZED: "No autorizado";
    readonly FORBIDDEN: "Acceso denegado";
    readonly NOT_FOUND: "Recurso no encontrado";
    readonly VALIDATION_ERROR: "Error de validación";
    readonly INTERNAL_ERROR: "Error interno del servidor";
    readonly DUPLICATE_ENTRY: "Registro duplicado";
    readonly INVALID_CREDENTIALS: "Credenciales inválidas";
    readonly TOKEN_EXPIRED: "Token expirado";
    readonly INSUFFICIENT_PERMISSIONS: "Permisos insuficientes";
};
export declare const RATE_LIMIT: {
    readonly WINDOW_MS: number;
    readonly MAX_REQUESTS: 100;
    readonly MESSAGE: "Demasiadas solicitudes desde esta IP, intente más tarde";
};
export declare const SECURITY_HEADERS: {
    readonly CONTENT_SECURITY_POLICY: "default-src 'self'";
    readonly X_FRAME_OPTIONS: "DENY";
    readonly X_CONTENT_TYPE_OPTIONS: "nosniff";
    readonly REFERRER_POLICY: "same-origin";
    readonly PERMISSIONS_POLICY: "geolocation=(), microphone=(), camera=()";
};
export declare const JWT_CONFIG: {
    readonly EXPIRES_IN: "24h";
    readonly REFRESH_EXPIRES_IN: "7d";
    readonly ALGORITHM: "HS256";
};
export declare const API_ENDPOINTS: {
    readonly AUTH: "/api/auth";
    readonly EMPLOYEES: "/api/employees";
    readonly COMPANIES: "/api/companies";
    readonly PAYROLLS: "/api/payrolls";
    readonly INCIDENCES: "/api/incidences";
    readonly CALENDARS: "/api/calendars";
    readonly REPORTS: "/api/reports";
    readonly HEALTH: "/api/health";
};
declare const _default: {
    INCIDENCE_TYPES: {
        readonly FALTAS: {
            readonly value: "faltas";
            readonly label: "Faltas";
            readonly unit: "días";
            readonly color: "red";
            readonly description: "Días no trabajados (descuento)";
            readonly defaultAmount: 1;
            readonly isDeduction: true;
        };
        readonly VACACIONES: {
            readonly value: "vacaciones";
            readonly label: "Vacaciones";
            readonly unit: "días";
            readonly color: "blue";
            readonly description: "Días de vacaciones (pago normal)";
            readonly defaultAmount: 1;
            readonly isDeduction: false;
        };
        readonly TIEMPO_EXTRA: {
            readonly value: "tiempo_extra";
            readonly label: "Tiempo Extra";
            readonly unit: "horas";
            readonly color: "green";
            readonly description: "Horas extras (pago doble)";
            readonly defaultAmount: 2;
            readonly isDeduction: false;
        };
        readonly PERMISOS: {
            readonly value: "permisos";
            readonly label: "Permisos";
            readonly unit: "días";
            readonly color: "yellow";
            readonly description: "Permisos con/sin goce de sueldo";
            readonly defaultAmount: 1;
            readonly isDeduction: false;
        };
        readonly BONOS: {
            readonly value: "bonos";
            readonly label: "Bonos";
            readonly unit: "cantidad";
            readonly color: "purple";
            readonly description: "Bonificaciones adicionales";
            readonly defaultAmount: 1000;
            readonly isDeduction: false;
        };
        readonly DESCUENTOS: {
            readonly value: "descuentos";
            readonly label: "Descuentos";
            readonly unit: "cantidad";
            readonly color: "orange";
            readonly description: "Descuentos varios";
            readonly defaultAmount: 500;
            readonly isDeduction: true;
        };
    };
    PAYROLL_STATUS: {
        readonly DRAFT: {
            readonly value: "draft";
            readonly label: "Borrador";
            readonly color: "gray";
            readonly description: "Nómina en edición";
        };
        readonly IN_PROGRESS: {
            readonly value: "in_progress";
            readonly label: "En Proceso";
            readonly color: "blue";
            readonly description: "Calculando nómina";
        };
        readonly PENDING_AUTHORIZATION: {
            readonly value: "pending_authorization";
            readonly label: "Pendiente de Autorización";
            readonly color: "yellow";
            readonly description: "Esperando autorización";
        };
        readonly AUTHORIZED: {
            readonly value: "authorized";
            readonly label: "Autorizada";
            readonly color: "green";
            readonly description: "Nómina autorizada";
        };
        readonly PAID: {
            readonly value: "paid";
            readonly label: "Pagada";
            readonly color: "green";
            readonly description: "Nómina pagada";
        };
        readonly REJECTED: {
            readonly value: "rejected";
            readonly label: "Rechazada";
            readonly color: "red";
            readonly description: "Nómina rechazada";
        };
    };
    USER_ROLES: {
        readonly ADMIN: {
            readonly value: "admin";
            readonly label: "Administrador";
            readonly permissions: readonly ["all"];
        };
        readonly OPERATOR: {
            readonly value: "operator";
            readonly label: "Operador";
            readonly permissions: readonly ["create_payroll", "manage_employees", "view_reports"];
        };
        readonly AUTHORIZER: {
            readonly value: "authorizer";
            readonly label: "Autorizador";
            readonly permissions: readonly ["authorize_payroll", "view_reports"];
        };
        readonly VIEWER: {
            readonly value: "viewer";
            readonly label: "Consultor";
            readonly permissions: readonly ["view_reports"];
        };
    };
    NOTIFICATION_TYPES: {
        readonly INFO: {
            readonly value: "info";
            readonly label: "Información";
            readonly color: "blue";
            readonly icon: "info";
        };
        readonly WARNING: {
            readonly value: "warning";
            readonly label: "Advertencia";
            readonly color: "yellow";
            readonly icon: "warning";
        };
        readonly ERROR: {
            readonly value: "error";
            readonly label: "Error";
            readonly color: "red";
            readonly icon: "error";
        };
        readonly SUCCESS: {
            readonly value: "success";
            readonly label: "Éxito";
            readonly color: "green";
            readonly icon: "success";
        };
    };
    PAYROLL_FREQUENCIES: {
        readonly QUINCENAL: {
            readonly value: "quincenal";
            readonly label: "Quincenal";
            readonly days: 15;
            readonly periodsPerYear: 24;
        };
        readonly MENSUAL: {
            readonly value: "mensual";
            readonly label: "Mensual";
            readonly days: 30;
            readonly periodsPerYear: 12;
        };
    };
    PAGINATION: {
        readonly DEFAULT_PAGE: 1;
        readonly DEFAULT_LIMIT: 10;
        readonly MAX_LIMIT: 100;
        readonly VALID_LIMITS: readonly [10, 25, 50, 100];
    };
    VALIDATION_LIMITS: {
        readonly EMPLOYEE_NAME_MIN: 2;
        readonly EMPLOYEE_NAME_MAX: 100;
        readonly EMPLOYEE_NUMBER_MAX: 50;
        readonly COMPANY_NAME_MIN: 2;
        readonly COMPANY_NAME_MAX: 100;
        readonly COMMENTS_MAX: 500;
        readonly PASSWORD_MIN: 8;
        readonly MAX_OVERTIME_HOURS: 12;
        readonly MAX_VACATION_DAYS: 30;
        readonly MAX_AMOUNT: 999999.99;
    };
    DATE_FORMATS: {
        readonly API: "YYYY-MM-DD";
        readonly DISPLAY: "DD/MM/YYYY";
        readonly DISPLAY_WITH_TIME: "DD/MM/YYYY HH:mm";
        readonly ISO: "YYYY-MM-DDTHH:mm:ss.sssZ";
    };
    ERROR_MESSAGES: {
        readonly UNAUTHORIZED: "No autorizado";
        readonly FORBIDDEN: "Acceso denegado";
        readonly NOT_FOUND: "Recurso no encontrado";
        readonly VALIDATION_ERROR: "Error de validación";
        readonly INTERNAL_ERROR: "Error interno del servidor";
        readonly DUPLICATE_ENTRY: "Registro duplicado";
        readonly INVALID_CREDENTIALS: "Credenciales inválidas";
        readonly TOKEN_EXPIRED: "Token expirado";
        readonly INSUFFICIENT_PERMISSIONS: "Permisos insuficientes";
    };
    RATE_LIMIT: {
        readonly WINDOW_MS: number;
        readonly MAX_REQUESTS: 100;
        readonly MESSAGE: "Demasiadas solicitudes desde esta IP, intente más tarde";
    };
    SECURITY_HEADERS: {
        readonly CONTENT_SECURITY_POLICY: "default-src 'self'";
        readonly X_FRAME_OPTIONS: "DENY";
        readonly X_CONTENT_TYPE_OPTIONS: "nosniff";
        readonly REFERRER_POLICY: "same-origin";
        readonly PERMISSIONS_POLICY: "geolocation=(), microphone=(), camera=()";
    };
    JWT_CONFIG: {
        readonly EXPIRES_IN: "24h";
        readonly REFRESH_EXPIRES_IN: "7d";
        readonly ALGORITHM: "HS256";
    };
    API_ENDPOINTS: {
        readonly AUTH: "/api/auth";
        readonly EMPLOYEES: "/api/employees";
        readonly COMPANIES: "/api/companies";
        readonly PAYROLLS: "/api/payrolls";
        readonly INCIDENCES: "/api/incidences";
        readonly CALENDARS: "/api/calendars";
        readonly REPORTS: "/api/reports";
        readonly HEALTH: "/api/health";
    };
};
export default _default;
//# sourceMappingURL=constants.d.ts.map