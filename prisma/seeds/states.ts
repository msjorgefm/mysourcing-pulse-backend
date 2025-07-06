import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Estados de México con sus códigos oficiales
const statesData = [
  { code: 'AGU', name: 'Aguascalientes', abbreviation: 'Ags.' },
  { code: 'BCN', name: 'Baja California', abbreviation: 'B.C.' },
  { code: 'BCS', name: 'Baja California Sur', abbreviation: 'B.C.S.' },
  { code: 'CAM', name: 'Campeche', abbreviation: 'Camp.' },
  { code: 'CHP', name: 'Chiapas', abbreviation: 'Chis.' },
  { code: 'CHH', name: 'Chihuahua', abbreviation: 'Chih.' },
  { code: 'COA', name: 'Coahuila', abbreviation: 'Coah.' },
  { code: 'COL', name: 'Colima', abbreviation: 'Col.' },
  { code: 'CMX', name: 'Ciudad de México', abbreviation: 'CDMX' },
  { code: 'DUR', name: 'Durango', abbreviation: 'Dgo.' },
  { code: 'GUA', name: 'Guanajuato', abbreviation: 'Gto.' },
  { code: 'GRO', name: 'Guerrero', abbreviation: 'Gro.' },
  { code: 'HID', name: 'Hidalgo', abbreviation: 'Hgo.' },
  { code: 'JAL', name: 'Jalisco', abbreviation: 'Jal.' },
  { code: 'MEX', name: 'Estado de México', abbreviation: 'Edomex' },
  { code: 'MIC', name: 'Michoacán', abbreviation: 'Mich.' },
  { code: 'MOR', name: 'Morelos', abbreviation: 'Mor.' },
  { code: 'NAY', name: 'Nayarit', abbreviation: 'Nay.' },
  { code: 'NLE', name: 'Nuevo León', abbreviation: 'N.L.' },
  { code: 'OAX', name: 'Oaxaca', abbreviation: 'Oax.' },
  { code: 'PUE', name: 'Puebla', abbreviation: 'Pue.' },
  { code: 'QUE', name: 'Querétaro', abbreviation: 'Qro.' },
  { code: 'ROO', name: 'Quintana Roo', abbreviation: 'Q. Roo' },
  { code: 'SLP', name: 'San Luis Potosí', abbreviation: 'S.L.P.' },
  { code: 'SIN', name: 'Sinaloa', abbreviation: 'Sin.' },
  { code: 'SON', name: 'Sonora', abbreviation: 'Son.' },
  { code: 'TAB', name: 'Tabasco', abbreviation: 'Tab.' },
  { code: 'TAM', name: 'Tamaulipas', abbreviation: 'Tamps.' },
  { code: 'TLA', name: 'Tlaxcala', abbreviation: 'Tlax.' },
  { code: 'VER', name: 'Veracruz', abbreviation: 'Ver.' },
  { code: 'YUC', name: 'Yucatán', abbreviation: 'Yuc.' },
  { code: 'ZAC', name: 'Zacatecas', abbreviation: 'Zac.' }
];

export async function seedStates() {
  console.log('🌱 Seeding states...');
  
  try {
    // Limpiar tabla existente
    await prisma.state.deleteMany();
    
    // Insertar nuevos datos
    const result = await prisma.state.createMany({
      data: statesData
    });
    
    console.log(`✅ Created ${result.count} states`);
  } catch (error) {
    console.error('❌ Error seeding states:', error);
    throw error;
  }
}