/**
 * Traduce errores técnicos de Prisma a mensajes amigables en español
 */
export function translatePrismaError(error: any): { message: string; code?: string } {
  const errorMessage = error.message || error.toString();
  
  // Log para debugging en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('Error original:', errorMessage);
  }
  
  // Errores de unique constraint
  if (errorMessage.includes('Unique constraint failed')) {
    if (errorMessage.includes('rfc')) {
      return { message: 'El RFC ya está registrado en el sistema', code: 'DUPLICATE_RFC' };
    }
    if (errorMessage.includes('curp')) {
      return { message: 'El CURP ya está registrado en el sistema', code: 'DUPLICATE_CURP' };
    }
    if (errorMessage.includes('employeeNumber') || errorMessage.includes('numeroTrabajador')) {
      return { message: 'El número de empleado ya existe en el sistema', code: 'DUPLICATE_EMPLOYEE_NUMBER' };
    }
    if (errorMessage.includes('email')) {
      return { message: 'El correo electrónico ya está registrado', code: 'DUPLICATE_EMAIL' };
    }
    if (errorMessage.includes('nss')) {
      return { message: 'El NSS (Número de Seguro Social) ya está registrado', code: 'DUPLICATE_NSS' };
    }
    return { message: 'Este registro ya existe en el sistema', code: 'DUPLICATE_ENTRY' };
  }
  
  // Errores de foreign key
  if (errorMessage.includes('Foreign key constraint failed')) {
    return { message: 'Error de referencia: algunos datos relacionados no existen', code: 'FOREIGN_KEY_ERROR' };
  }
  
  // Errores de campos requeridos
  if (errorMessage.includes('Null constraint violation') || errorMessage.includes('NOT NULL constraint failed')) {
    if (errorMessage.includes('name') || errorMessage.includes('nombres')) {
      return { message: 'El nombre es requerido', code: 'MISSING_NAME' };
    }
    if (errorMessage.includes('rfc')) {
      return { message: 'El RFC es requerido', code: 'MISSING_RFC' };
    }
    if (errorMessage.includes('curp')) {
      return { message: 'El CURP es requerido', code: 'MISSING_CURP' };
    }
    if (errorMessage.includes('email')) {
      return { message: 'El correo electrónico es requerido', code: 'MISSING_EMAIL' };
    }
    if (errorMessage.includes('employeeNumber') || errorMessage.includes('numeroTrabajador')) {
      return { message: 'El número de empleado es requerido', code: 'MISSING_EMPLOYEE_NUMBER' };
    }
    if (errorMessage.includes('position')) {
      return { message: 'El puesto es requerido', code: 'MISSING_POSITION' };
    }
    if (errorMessage.includes('hireDate')) {
      return { message: 'La fecha de ingreso es requerida', code: 'MISSING_HIRE_DATE' };
    }
    return { message: 'Faltan campos requeridos para completar el registro', code: 'MISSING_REQUIRED_FIELDS' };
  }
  
  // Errores de validación de datos
  if (errorMessage.includes('Invalid value for argument') || errorMessage.includes('Argument') && errorMessage.includes('is missing')) {
    return { message: 'Datos inválidos. Por favor verifica la información ingresada', code: 'INVALID_DATA' };
  }
  
  // Errores de conexión
  if (errorMessage.includes('Can\'t reach database server') || errorMessage.includes('Connection refused')) {
    return { message: 'No se puede conectar con la base de datos. Intente nuevamente más tarde', code: 'DATABASE_CONNECTION_ERROR' };
  }
  
  // Errores de permisos
  if (errorMessage.includes('Access denied') || errorMessage.includes('permission denied')) {
    return { message: 'No tiene permisos para realizar esta operación', code: 'ACCESS_DENIED' };
  }
  
  // Errores de registro no encontrado
  if (errorMessage.includes('Record to update not found') || errorMessage.includes('Record to delete does not exist')) {
    return { message: 'El registro que intenta modificar no existe', code: 'RECORD_NOT_FOUND' };
  }
  
  // Errores de validación específicos
  if (errorMessage.includes('Invalid email format')) {
    return { message: 'El formato del correo electrónico es inválido', code: 'INVALID_EMAIL_FORMAT' };
  }
  
  if (errorMessage.includes('RFC format') || (errorMessage.includes('rfc') && errorMessage.includes('pattern'))) {
    return { message: 'El formato del RFC es inválido. Debe tener 12 o 13 caracteres', code: 'INVALID_RFC_FORMAT' };
  }
  
  if (errorMessage.includes('CURP format') || (errorMessage.includes('curp') && errorMessage.includes('pattern'))) {
    return { message: 'El formato del CURP es inválido. Debe tener 18 caracteres', code: 'INVALID_CURP_FORMAT' };
  }
  
  if (errorMessage.includes('NSS format') || (errorMessage.includes('nss') && errorMessage.includes('pattern'))) {
    return { message: 'El formato del NSS es inválido. Debe tener 11 dígitos', code: 'INVALID_NSS_FORMAT' };
  }
  
  // Errores de fecha
  if (errorMessage.includes('Invalid date format') || errorMessage.includes('Invalid datetime')) {
    return { message: 'Formato de fecha inválido. Use DD/MM/AAAA', code: 'INVALID_DATE_FORMAT' };
  }
  
  // Errores de número
  if (errorMessage.includes('Invalid number') || errorMessage.includes('Expected number')) {
    return { message: 'Valor numérico inválido', code: 'INVALID_NUMBER' };
  }
  
  // Errores de enum/opciones válidas
  if (errorMessage.includes('Invalid enum value')) {
    if (errorMessage.includes('status')) {
      return { message: 'Estado inválido. Use: ACTIVE, INACTIVE, TERMINATED o ON_LEAVE', code: 'INVALID_STATUS' };
    }
    if (errorMessage.includes('contractType')) {
      return { message: 'Tipo de contrato inválido. Use: INDEFINIDO, TIEMPO_DETERMINADO, MEDIO_TIEMPO, CONTRATISTA o PRACTICANTE', code: 'INVALID_CONTRACT_TYPE' };
    }
    if (errorMessage.includes('role')) {
      return { message: 'Rol inválido. Use: ADMIN, OPERATOR, CLIENT o EMPLOYEE', code: 'INVALID_ROLE' };
    }
    return { message: 'Valor inválido para el campo seleccionado. Verifique que esté usando una opción válida de la lista', code: 'INVALID_ENUM_VALUE' };
  }
  
  // Errores de formato JSON
  if (errorMessage.includes('Invalid JSON') || errorMessage.includes('JSON.parse')) {
    return { message: 'Formato de datos inválido. Verifique que todos los campos tengan el formato correcto (fechas: DD/MM/AAAA, números sin letras, etc.)', code: 'INVALID_JSON_FORMAT' };
  }
  
  // Errores de límites de la base de datos
  if (errorMessage.includes('value too long') || errorMessage.includes('String or binary data would be truncated')) {
    if (errorMessage.includes('name')) {
      return { message: 'El nombre es demasiado largo. Máximo 100 caracteres', code: 'NAME_TOO_LONG' };
    }
    if (errorMessage.includes('address')) {
      return { message: 'La dirección es demasiado larga. Máximo 200 caracteres', code: 'ADDRESS_TOO_LONG' };
    }
    if (errorMessage.includes('comments') || errorMessage.includes('description')) {
      return { message: 'El texto es demasiado largo. Máximo 500 caracteres', code: 'TEXT_TOO_LONG' };
    }
    return { message: 'Uno o más campos exceden la longitud máxima permitida', code: 'VALUE_TOO_LONG' };
  }
  
  // Errores de tipo de dato
  if (errorMessage.includes('incorrect type') || errorMessage.includes('type mismatch')) {
    return { message: 'Tipo de dato incorrecto. Verifique que los números no contengan letras y las fechas tengan el formato correcto', code: 'TYPE_MISMATCH' };
  }
  
  // Errores de conversión
  if (errorMessage.includes('Failed to convert') || errorMessage.includes('Cannot convert')) {
    if (errorMessage.includes('date')) {
      return { message: 'Formato de fecha inválido. Use DD/MM/AAAA o AAAA-MM-DD', code: 'DATE_CONVERSION_ERROR' };
    }
    if (errorMessage.includes('number') || errorMessage.includes('decimal')) {
      return { message: 'Valor numérico inválido. Asegúrese de usar solo números y punto decimal', code: 'NUMBER_CONVERSION_ERROR' };
    }
    return { message: 'Formato de datos incorrecto. Verifique que los valores correspondan al tipo de campo', code: 'CONVERSION_ERROR' };
  }
  
  // Error por defecto
  if (process.env.NODE_ENV === 'development') {
    // En desarrollo, mostrar más información
    return { message: `Error del sistema: ${errorMessage}`, code: 'SYSTEM_ERROR' };
  }
  
  // En producción, mensaje genérico
  return { message: 'Error al procesar la información. Por favor verifica que todos los campos tengan el formato correcto y los datos sean válidos', code: 'GENERIC_ERROR' };
}