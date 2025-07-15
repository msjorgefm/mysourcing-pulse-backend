# Instrucciones para aplicar la migración de aprobaciones

## Pasos para aplicar los cambios a la base de datos:

### Opción 1: Usando Prisma Migrate (Recomendado)

1. **Generar el cliente de Prisma**:
   ```bash
   cd mysourcing-pulse-backend
   npx prisma generate
   ```

2. **Crear y aplicar la migración**:
   ```bash
   npx prisma migrate dev --name add_approval_fields
   ```

3. **Reiniciar el servidor**:
   ```bash
   npm run dev
   ```

### Opción 2: Aplicar manualmente el SQL

1. **Conectarse a la base de datos**:
   ```bash
   psql -U tu_usuario -d tu_base_de_datos
   ```

2. **Ejecutar el script SQL**:
   ```bash
   \i migration-approval-fields.sql
   ```

3. **Generar el cliente de Prisma**:
   ```bash
   npx prisma generate
   ```

4. **Reiniciar el servidor**:
   ```bash
   npm run dev
   ```

## Después de aplicar la migración:

1. **Descomentar el código en los controladores**:
   - En `src/controllers/incidenciasController.ts`:
     - Líneas 87-88: Descomentar createdBy y createdByUserId
     - Líneas 93-98: Descomentar campos de calendario y período
     - Líneas 280, 292-298, 329-330, 352-355, etc.
   
   - En `src/controllers/payrollApprovalController.ts`:
     - Líneas 31, 34-41: Descomentar campos de aprobación
     - Líneas 104-106: Descomentar campos de aprobación
     - Y otros campos comentados

2. **Verificar que todo funciona**:
   - El servidor debe iniciar sin errores
   - Las incidencias deben poder guardarse con calendario y período
   - El módulo de aprobaciones debe funcionar correctamente

## Campos agregados:

### En la tabla `incidences`:
- `createdBy` - Rol del usuario que creó (OPERATOR, CLIENT, DEPARTMENT_HEAD)
- `createdByUserId` - ID del usuario que creó
- `approvedBy` - ID del usuario que aprobó/rechazó
- `approvalDate` - Fecha de aprobación/rechazo
- `rejectionReason` - Motivo del rechazo

### En la tabla `payrolls`:
- `payrollCalendarId` - Relación con calendario
- `approvalStatus` - Estado de aprobación (PENDING, APPROVED, REJECTED)
- `clientApprovedBy` - ID del cliente que aprobó
- `clientApprovalDate` - Fecha de aprobación
- `clientRejectionReason` - Motivo del rechazo
- `createdBy` - ID del operador que creó

## Nota importante:
Los campos están comentados temporalmente para que el servidor pueda ejecutarse. Una vez aplicada la migración, debes descomentar estos campos para que la funcionalidad completa esté disponible.