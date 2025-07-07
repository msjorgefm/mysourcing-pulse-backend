import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedIMSSDelegaciones = async () => {
  console.log('🌱 Seeding IMSS Delegaciones...');

  const delegaciones = [
    // ÓRGANOS DE OPERACIÓN ADMINISTRATIVA DESCONCENTRADA (OOAD) DEL IMSS
    { codigo: '01', nombre: 'Aguascalientes', entidadFederativaCode: 'AGU' },
    { codigo: '02', nombre: 'Baja California', entidadFederativaCode: 'BCN' },
    { codigo: '03', nombre: 'Baja California Sur', entidadFederativaCode: 'BCS' },
    { codigo: '04', nombre: 'Campeche', entidadFederativaCode: 'CAM' },
    { codigo: '25', nombre: 'Coahuila', entidadFederativaCode: 'COA' },
    { codigo: '06', nombre: 'Colima', entidadFederativaCode: 'COL' },
    { codigo: '07', nombre: 'Chiapas', entidadFederativaCode: 'CHP' },
    { codigo: '08', nombre: 'Chihuahua', entidadFederativaCode: 'CHH' },
    { codigo: '09', nombre: 'Ciudad de México Norte', entidadFederativaCode: 'CMX' },
    { codigo: '10', nombre: 'Ciudad de México Sur', entidadFederativaCode: 'CMX' },
    { codigo: '11', nombre: 'Durango', entidadFederativaCode: 'DUR' },
    { codigo: '12', nombre: 'Guanajuato', entidadFederativaCode: 'GUA' },
    { codigo: '13', nombre: 'Guerrero', entidadFederativaCode: 'GRO' },
    { codigo: '14', nombre: 'Hidalgo', entidadFederativaCode: 'HID' },
    { codigo: '15', nombre: 'Jalisco', entidadFederativaCode: 'JAL' },
    { codigo: '16', nombre: 'Estado de México Oriente', entidadFederativaCode: 'MEX' },
    { codigo: '17', nombre: 'Estado de México Poniente', entidadFederativaCode: 'MEX' },
    { codigo: '18', nombre: 'Michoacán', entidadFederativaCode: 'MIC' },
    { codigo: '19', nombre: 'Morelos', entidadFederativaCode: 'MOR' },
    { codigo: '20', nombre: 'Nayarit', entidadFederativaCode: 'NAY' },
    { codigo: '21', nombre: 'Nuevo León', entidadFederativaCode: 'NLE' },
    { codigo: '22', nombre: 'Oaxaca', entidadFederativaCode: 'OAX' },
    { codigo: '23', nombre: 'Puebla', entidadFederativaCode: 'PUE' },
    { codigo: '24', nombre: 'Querétaro', entidadFederativaCode: 'QUE' },
    { codigo: '26', nombre: 'Quintana Roo', entidadFederativaCode: 'ROO' },
    { codigo: '27', nombre: 'San Luis Potosí', entidadFederativaCode: 'SLP' },
    { codigo: '28', nombre: 'Sinaloa', entidadFederativaCode: 'SIN' },
    { codigo: '29', nombre: 'Sonora', entidadFederativaCode: 'SON' },
    { codigo: '30', nombre: 'Tabasco', entidadFederativaCode: 'TAB' },
    { codigo: '31', nombre: 'Tamaulipas', entidadFederativaCode: 'TAM' },
    { codigo: '32', nombre: 'Tlaxcala', entidadFederativaCode: 'TLA' },
    { codigo: '33', nombre: 'Veracruz Norte', entidadFederativaCode: 'VER' },
    { codigo: '34', nombre: 'Veracruz Sur', entidadFederativaCode: 'VER' },
    { codigo: '35', nombre: 'Yucatán', entidadFederativaCode: 'YUC' },
    { codigo: '36', nombre: 'Zacatecas', entidadFederativaCode: 'ZAC' },
  ];

  for (const delegacion of delegaciones) {
    await prisma.iMSSDelegacion.upsert({
      where: { codigo: delegacion.codigo },
      update: {},
      create: delegacion,
    });
  }

  console.log('✅ IMSS Delegaciones seeded successfully');
};

// If run directly
if (require.main === module) {
  seedIMSSDelegaciones()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}