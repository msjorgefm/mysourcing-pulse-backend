import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const imssRiskClassData = [
  {
    codigo: 'I',
    nombre: 'Clase I',
    descripcion: 'Riesgo ordinario de vida (actividades de oficina y comercio)',
  },
  {
    codigo: 'II',
    nombre: 'Clase II',
    descripcion: 'Riesgo bajo (actividades de servicios)',
  },
  {
    codigo: 'III',
    nombre: 'Clase III',
    descripcion: 'Riesgo medio (actividades de manufactura ligera)',
  },
  {
    codigo: 'IV',
    nombre: 'Clase IV',
    descripcion: 'Riesgo alto (actividades de construcción y manufactura pesada)',
  },
  {
    codigo: 'V',
    nombre: 'Clase V',
    descripcion: 'Riesgo máximo (actividades de alta peligrosidad)',
  },
];

export async function seedImssRiskClasses() {
  console.log('Seeding IMSS Risk Classes...');
  
  for (const riskClass of imssRiskClassData) {
    await prisma.claseRiesgoIMSS.upsert({
      where: { codigo: riskClass.codigo },
      update: {
        nombre: riskClass.nombre,
        descripcion: riskClass.descripcion,
      },
      create: riskClass,
    });
  }
  
  console.log('IMSS Risk Classes seeded successfully');
}