export const INCIDENCE_TYPES = {
  FALTAS: {
    value: 'faltas',
    label: 'Faltas',
    unit: 'días',
    color: 'red',
    description: 'Días no trabajados (descuento)',
    defaultAmount: 1,
    isDeduction: true
  },
  VACACIONES: {
    value: 'vacaciones',
    label: 'Vacaciones',
    unit: 'días',
    color: 'blue',
    description: 'Días de vacaciones (pago normal)',
    defaultAmount: 1,
    isDeduction: false
  },
  TIEMPO_EXTRA: {
    value: 'tiempo_extra',
    label: 'Tiempo Extra',
    unit: 'horas',
    color: 'green',
    description: 'Horas extras (pago doble)',
    defaultAmount: 2,
    isDeduction: false
  },
  PERMISOS: {
    value: 'permisos',
    label: 'Permisos',
    unit: 'días',
    color: 'yellow',
    description: 'Permisos con/sin goce de sueldo',
    defaultAmount: 1,
    isDeduction: false
  },
  BONOS: {
    value: 'bonos',
    label: 'Bonos',
    unit: 'cantidad',
    color: 'purple',
    description: 'Bonificaciones adicionales',
    defaultAmount: 1000,
    isDeduction: false
  },
  DESCUENTOS: {
    value: 'descuentos',
    label: 'Descuentos',
    unit: 'cantidad',
    color: 'orange',
    description: 'Descuentos varios',
    defaultAmount: 500,
    isDeduction: true
  }
} as const;

// Estados de nómina
export const PAYROLL_STATUS = {
  DRAFT: {
    value: 'draft',
    label: 'Borrador',
    color: 'gray',
    description: 'Nómina en edición'
  },
  IN_PROGRESS: {
    value: 'in_progress',
    label: 'En Proceso',
    color: 'blue',
    description: 'Calculando nómina'
  },
  PENDING_AUTHORIZATION: {
    value: 'pending_authorization',
    label: 'Pendiente de Autorización',
    color: 'yellow',
    description: 'Esperando autorización'
  },
  AUTHORIZED: {
    value: 'authorized',
    label: 'Autorizada',
    color: 'green',
    description: 'Nómina autorizada'
  },
  PAID: {
    value: 'paid',
    label: 'Pagada',
    color: 'green',
    description: 'Nómina pagada'
  },
  REJECTED: {
    value: 'rejected',
    label: 'Rechazada',
    color: 'red',
    description: 'Nómina rechazada'
  }
} as const;

// Roles de usuario
export const USER_ROLES = {
  ADMIN: {
    value: 'admin',
    label: 'Administrador',
    permissions: ['all']
  },
  OPERATOR: {
    value: 'operator',
    label: 'Operador',
    permissions: ['create_payroll', 'manage_employees', 'view_reports']
  },
  AUTHORIZER: {
    value: 'authorizer',
    label: 'Autorizador',
    permissions: ['authorize_payroll', 'view_reports']
  },
  VIEWER: {
    value: 'viewer',
    label: 'Consultor',
    permissions: ['view_reports']
  }
} as const;

// Tipos de notificaciones
export const NOTIFICATION_TYPES = {
  INFO: {
    value: 'info',
    label: 'Información',
    color: 'blue',
    icon: 'info'
  },
  WARNING: {
    value: 'warning',
    label: 'Advertencia',
    color: 'yellow',
    icon: 'warning'
  },
  ERROR: {
    value: 'error',
    label: 'Error',
    color: 'red',
    icon: 'error'
  },
  SUCCESS: {
    value: 'success',
    label: 'Éxito',
    color: 'green',
    icon: 'success'
  }
} as const;

// Frecuencias de nómina
export const PAYROLL_FREQUENCIES = {
  QUINCENAL: {
    value: 'quincenal',
    label: 'Quincenal',
    days: 15,
    periodsPerYear: 24
  },
  MENSUAL: {
    value: 'mensual',
    label: 'Mensual',
    days: 30,
    periodsPerYear: 12
  }
} as const;

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  VALID_LIMITS: [10, 25, 50, 100]
} as const;

// Límites de validación
export const VALIDATION_LIMITS = {
  EMPLOYEE_NAME_MIN: 2,
  EMPLOYEE_NAME_MAX: 100,
  EMPLOYEE_NUMBER_MAX: 50,
  COMPANY_NAME_MIN: 2,
  COMPANY_NAME_MAX: 100,
  COMMENTS_MAX: 500,
  PASSWORD_MIN: 8,
  MAX_OVERTIME_HOURS: 12,
  MAX_VACATION_DAYS: 30,
  MAX_AMOUNT: 999999.99
} as const;

// Formatos de fecha
export const DATE_FORMATS = {
  API: 'YYYY-MM-DD',
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DDTHH:mm:ss.sssZ'
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'Recurso no encontrado',
  VALIDATION_ERROR: 'Error de validación',
  INTERNAL_ERROR: 'Error interno del servidor',
  DUPLICATE_ENTRY: 'Registro duplicado',
  INVALID_CREDENTIALS: 'Credenciales inválidas',
  TOKEN_EXPIRED: 'Token expirado',
  INSUFFICIENT_PERMISSIONS: 'Permisos insuficientes'
} as const;

// Configuración de rate limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  MAX_REQUESTS: 100, // máximo 100 requests por ventana
  MESSAGE: 'Demasiadas solicitudes desde esta IP, intente más tarde'
} as const;

// Headers de seguridad
export const SECURITY_HEADERS = {
  CONTENT_SECURITY_POLICY: "default-src 'self'",
  X_FRAME_OPTIONS: 'DENY',
  X_CONTENT_TYPE_OPTIONS: 'nosniff',
  REFERRER_POLICY: 'same-origin',
  PERMISSIONS_POLICY: 'geolocation=(), microphone=(), camera=()'
} as const;

// Configuración de JWT
export const JWT_CONFIG = {
  EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256' as const
} as const;

// URLs y endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  WORKERS: '/api/workers',
  COMPANIES: '/api/companies',
  PAYROLLS: '/api/payrolls',
  INCIDENCES: '/api/incidences',
  CALENDARS: '/api/calendars',
  REPORTS: '/api/reports',
  HEALTH: '/api/health'
} as const;

export default {
  INCIDENCE_TYPES,
  PAYROLL_STATUS,
  USER_ROLES,
  NOTIFICATION_TYPES,
  PAYROLL_FREQUENCIES,
  PAGINATION,
  VALIDATION_LIMITS,
  DATE_FORMATS,
  ERROR_MESSAGES,
  RATE_LIMIT,
  SECURITY_HEADERS,
  JWT_CONFIG,
  API_ENDPOINTS
};