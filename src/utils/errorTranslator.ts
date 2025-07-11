/**
 * Traduce errores técnicos de Prisma a mensajes amigables en español
 */
export function translatePrismaError(error: any): string {
  const errorMessage = error.message || error.toString();
  
  // Log para debugging en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('Error original:', errorMessage);
  }
  
  // Errores de unique constraint
  if (errorMessage.includes('Unique constraint failed')) {
    if (errorMessage.includes('rfc')) {
      return 'El RFC ya está registrado en el sistema';
    }
    if (errorMessage.includes('curp')) {
      return 'El CURP ya está registrado en el sistema';
    }
    if (errorMessage.includes('employeeNumber')) {
      return 'El número de empleado ya existe en el sistema';
    }
    if (errorMessage.includes('email')) {
      return 'El correo electrónico ya está registrado';
    }
    if (errorMessage.includes('nss')) {
      return 'El NSS (Número de Seguro Social) ya está registrado';
    }
    return 'Este registro ya existe en el sistema';
  }
  
  // Errores de foreign key
  if (errorMessage.includes('Foreign key constraint failed')) {
    return 'Error de referencia: algunos datos relacionados no existen';
  }
  
  // Errores de campos requeridos
  if (errorMessage.includes('Null constraint violation') || errorMessage.includes('NOT NULL constraint failed')) {
    if (errorMessage.includes('name')) {
      return 'El nombre es requerido';
    }
    if (errorMessage.includes('rfc')) {
      return 'El RFC es requerido';
    }
    if (errorMessage.includes('curp')) {
      return 'El CURP es requerido';
    }
    if (errorMessage.includes('email')) {
      return 'El correo electrónico es requerido';
    }
    if (errorMessage.includes('employeeNumber')) {
      return 'El número de empleado es requerido';
    }
    if (errorMessage.includes('position')) {
      return 'El puesto es requerido';
    }
    if (errorMessage.includes('hireDate')) {
      return 'La fecha de ingreso es requerida';
    }
    return 'Faltan campos requeridos para completar el registro';
  }
  
  // Errores de Prisma específicos para tipos de datos
  if (errorMessage.includes('Invalid value provided')) {
    // Buscar el campo específico
    const fieldMatch = errorMessage.match(/Expected (\w+) for (\w+)\.(\w+), provided (\w+)/);
    if (fieldMatch) {
      const expectedType = fieldMatch[1];
      const model = fieldMatch[2];
      const field = fieldMatch[3];
      const providedType = fieldMatch[4];
      
      const typeTranslations: Record<string, string> = {
        'String': 'texto',
        'Int': 'número entero',
        'Float': 'número decimal',
        'Boolean': 'verdadero/falso',
        'DateTime': 'fecha'
      };
      
      const fieldTranslations: Record<string, string> = {
        'sexo': 'género',
        'estadoCivil': 'estado civil',
        'tipoSalario': 'tipo de salario',
        'tipoContrato': 'tipo de contrato',
        'claseRiesgo': 'clase de riesgo IMSS'
      };
      
      const translatedField = fieldTranslations[field] || field;
      const translatedType = typeTranslations[expectedType] || expectedType;
      
      return `El campo ${translatedField} debe ser de tipo ${translatedType}`;
    }
  }
  
  // Errores de validación de datos
  if (errorMessage.includes('Invalid `prisma') || errorMessage.includes('Argument')) {
    // Extraer información del campo problemático
    if (errorMessage.includes('Invalid date')) {
      const dateFieldMatch = errorMessage.match(/for field `(\w+)`/);
      const fieldName = dateFieldMatch ? dateFieldMatch[1] : 'fecha';
      const fieldTranslations: Record<string, string> = {
        'hireDate': 'fecha de ingreso',
        'dateOfBirth': 'fecha de nacimiento',
        'fechaIngreso': 'fecha de ingreso',
        'fechaNacimiento': 'fecha de nacimiento',
        'fechaAntiguedad': 'fecha de antigüedad',
        'fechaInicioInfonavit': 'fecha de inicio de crédito Infonavit',
        'fechaTerminoInfonavit': 'fecha de término de crédito Infonavit',
        'fechaInicioFonacot': 'fecha de inicio de crédito Fonacot',
        'fechaTerminoFonacot': 'fecha de término de crédito Fonacot',
        'fechaInicioPension': 'fecha de inicio de pensión alimenticia'
      };
      const translatedField = fieldTranslations[fieldName] || fieldName;
      return `Formato de fecha inválido en ${translatedField}. Use el formato DD/MM/AAAA o AAAA-MM-DD`;
    }
    
    if (errorMessage.includes('Expected a valid') && errorMessage.includes('number')) {
      const numberFieldMatch = errorMessage.match(/for field `(\w+)`/);
      const fieldName = numberFieldMatch ? numberFieldMatch[1] : 'campo numérico';
      const fieldTranslations: Record<string, string> = {
        'baseSalary': 'salario base',
        'salarioDiario': 'salario diario',
        'sueldoBaseCotizacion': 'sueldo base de cotización',
        'montoDescuentoInfonavit': 'monto de descuento Infonavit',
        'retencionMensualFonacot': 'retención mensual Fonacot',
        'valorDescuentoPension': 'valor de descuento de pensión'
      };
      const translatedField = fieldTranslations[fieldName] || fieldName;
      return `Se esperaba un valor numérico válido en ${translatedField}. No use letras ni caracteres especiales`;
    }
    
    if (errorMessage.includes('Invalid enum value')) {
      // Buscar el valor y campo específicos
      const enumMatch = errorMessage.match(/Invalid enum value\. Expected (.+?) for field `(\w+)`/);
      if (enumMatch) {
        const expectedValues = enumMatch[1];
        const fieldName = enumMatch[2];
        const fieldTranslations: Record<string, string> = {
          'contractType': 'tipo de contrato',
          'tipoContrato': 'tipo de contrato',
          'tipoSalario': 'tipo de salario',
          'tipoJornada': 'tipo de jornada',
          'modalidadTrabajo': 'modalidad de trabajo',
          'claseRiesgo': 'clase de riesgo IMSS',
          'tipoTrabajador': 'tipo de trabajador',
          'situacionContractual': 'situación contractual',
          'genero': 'género',
          'estadocivil': 'estado civil',
          'zonaGeografica': 'zona geográfica'
        };
        const translatedField = fieldTranslations[fieldName] || fieldName;
        return `Valor inválido para ${translatedField}. Los valores permitidos son: ${expectedValues}`;
      }
      return 'Valor inválido para el campo seleccionado. Verifique que esté usando una opción válida de la lista';
    }
    
    // Si no podemos identificar el error específico, dar más contexto
    return 'Formato de datos inválido. Verifique que todos los campos tengan el formato correcto (fechas: DD/MM/AAAA, números sin letras, etc.)';
  }
  
  // Errores de longitud de campo
  if (errorMessage.includes('String or binary data would be truncated') || errorMessage.includes('too long')) {
    const lengthMatch = errorMessage.match(/field `(\w+)`/);
    if (lengthMatch) {
      const fieldName = lengthMatch[1];
      const fieldTranslations: Record<string, string> = {
        'name': 'nombre',
        'email': 'correo electrónico',
        'address': 'dirección',
        'phone': 'teléfono',
        'position': 'puesto',
        'department': 'departamento'
      };
      const translatedField = fieldTranslations[fieldName] || fieldName;
      return `El campo ${translatedField} excede la longitud máxima permitida`;
    }
    return 'Uno o más campos exceden la longitud máxima permitida';
  }
  
  // Errores de tipo de dato
  if (errorMessage.includes('incorrect data type')) {
    return 'Tipo de dato incorrecto. Verifique que los números no contengan letras y las fechas tengan el formato correcto';
  }
  
  // Errores de conversión de datos
  if (errorMessage.includes('Cannot convert') || errorMessage.includes('Invalid value')) {
    if (errorMessage.includes('DateTime')) {
      return 'Formato de fecha inválido. Use DD/MM/AAAA o AAAA-MM-DD';
    }
    if (errorMessage.includes('Int') || errorMessage.includes('Float') || errorMessage.includes('Decimal')) {
      return 'Valor numérico inválido. Asegúrese de usar solo números y punto decimal';
    }
    return 'Formato de datos incorrecto. Verifique que los valores correspondan al tipo de campo';
  }
  
  // Errores de validación específicos
  if (errorMessage.includes('debe ser') || errorMessage.includes('must be')) {
    return errorMessage.replace('must be', 'debe ser').replace('at least', 'al menos').replace('at most', 'como máximo');
  }
  
  // Error genérico mejorado
  console.error('Error no traducido:', errorMessage); // Para debugging
  return 'Error al procesar la información. Por favor verifica que todos los campos tengan el formato correcto y los datos sean válidos';
}

/**
 * Traduce errores de validación específicos del empleado
 */
export function translateEmployeeValidationError(field: string, error: string): string {
  const fieldTranslations: Record<string, string> = {
    numeroEmpleado: 'Número de empleado',
    nombres: 'Nombre(s)',
    primerApellido: 'Primer apellido',
    segundoApellido: 'Segundo apellido',
    rfc: 'RFC',
    curp: 'CURP',
    nss: 'NSS',
    fechaNacimiento: 'Fecha de nacimiento',
    genero: 'Género',
    estadocivil: 'Estado civil',
    telefono: 'Teléfono',
    email: 'Correo electrónico',
    codigoPostal: 'Código postal',
    fechaIngreso: 'Fecha de ingreso',
    salarioDiario: 'Salario diario',
    puesto: 'Puesto',
    tipoContrato: 'Tipo de contrato'
  };
  
  const fieldName = fieldTranslations[field] || field;
  
  // Traducir mensajes de error comunes
  if (error.includes('required')) {
    return `${fieldName} es requerido`;
  }
  
  if (error.includes('invalid')) {
    return `${fieldName} tiene un formato inválido`;
  }
  
  if (error.includes('must be')) {
    return `${fieldName} debe ser válido`;
  }
  
  if (error.includes('already exists')) {
    return `${fieldName} ya existe en el sistema`;
  }
  
  return `Error en ${fieldName}: ${error}`;
}