import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedIMSSOrigenMovimiento = async () => {
  console.log('🌱 Seeding IMSS Origen Movimiento...');

  const origenesMovimiento = [
    {
      codigo: '01',
      nombre: 'ALTA',
      descripcion: 'Afiliación inicial del trabajador al IMSS. Debe presentarse un día hábil antes del ingreso del trabajador',
    },
    {
      codigo: '02',
      nombre: 'REINGRESO',
      descripcion: 'Reincorporación del trabajador después de haber sido dado de baja. Aplica cuando el trabajador regresa a la misma empresa',
    },
    {
      codigo: '03',
      nombre: 'BAJA',
      descripcion: 'Terminación de la relación laboral por cualquier causa (renuncia, despido, fin de contrato, defunción, etc.)',
    },
    {
      codigo: '07',
      nombre: 'MODIFICACIÓN DE SALARIO',
      descripcion: 'Cambio en el salario base de cotización del trabajador por aumento, promoción o cambio de puesto',
    },
    {
      codigo: '08',
      nombre: 'MODIFICACIÓN DE JORNADA/SEMANA REDUCIDA',
      descripcion: 'Cambio en el tipo de jornada laboral o días trabajados a la semana',
    },
    {
      codigo: '09',
      nombre: 'MODIFICACIÓN DE NOMBRE',
      descripcion: 'Corrección o actualización del nombre del trabajador en los registros del IMSS',
    },
    {
      codigo: '10',
      nombre: 'MODIFICACIÓN DE UNIDAD DE MEDICINA FAMILIAR',
      descripcion: 'Cambio de la clínica o unidad médica asignada al trabajador',
    },
    {
      codigo: '11',
      nombre: 'MODIFICACIÓN DE REGISTRO PATRONAL',
      descripcion: 'Cambio del registro patronal cuando el trabajador se transfiere a otra sucursal o centro de trabajo',
    },
    {
      codigo: '12',
      nombre: 'MODIFICACIÓN DE CLAVE DE TRABAJADOR',
      descripcion: 'Corrección o actualización del CURP o NSS del trabajador',
    },
  ];

  for (const origen of origenesMovimiento) {
    await prisma.iMSSOrigenMovimiento.upsert({
      where: { codigo: origen.codigo },
      update: {},
      create: origen,
    });
  }

  console.log('✅ IMSS Origen Movimiento seeded successfully');
};

// If run directly
if (require.main === module) {
  seedIMSSOrigenMovimiento()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}