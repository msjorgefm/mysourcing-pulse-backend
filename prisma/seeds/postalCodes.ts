import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Datos de ejemplo de códigos postales de México (SEPOMEX)
// En producción, estos datos deberían venir de un archivo CSV completo de SEPOMEX
const postalCodesData = [
  // Oaxaca
  { postalCode: '68000', neighborhood: 'Centro', city: 'Oaxaca de Juárez', state: 'OAX', municipality: 'Oaxaca de Juárez' },
  { postalCode: '68000', neighborhood: 'Barrio de Jalatlaco', city: 'Oaxaca de Juárez', state: 'OAX', municipality: 'Oaxaca de Juárez' },
  { postalCode: '68040', neighborhood: 'Reforma', city: 'Oaxaca de Juárez', state: 'OAX', municipality: 'Oaxaca de Juárez' },
  { postalCode: '68050', neighborhood: 'América', city: 'Oaxaca de Juárez', state: 'OAX', municipality: 'Oaxaca de Juárez' },
  { postalCode: '68120', neighborhood: 'Santa Rosa', city: 'Oaxaca de Juárez', state: 'OAX', municipality: 'Oaxaca de Juárez' },
  { postalCode: '68130', neighborhood: 'Volcanes', city: 'Oaxaca de Juárez', state: 'OAX', municipality: 'Oaxaca de Juárez' },
  { postalCode: '68140', neighborhood: 'Estrella', city: 'Oaxaca de Juárez', state: 'OAX', municipality: 'Oaxaca de Juárez' },
  { postalCode: '68240', neighborhood: 'San Felipe del Agua', city: 'San Felipe del Agua', state: 'OAX', municipality: 'San Felipe del Agua' },
  { postalCode: '68240', neighborhood: 'Lomas de San Felipe', city: 'San Felipe del Agua', state: 'OAX', municipality: 'San Felipe del Agua' },
  { postalCode: '68240', neighborhood: 'Residencial San Felipe', city: 'San Felipe del Agua', state: 'OAX', municipality: 'San Felipe del Agua' },
  
  // Ciudad de México
  { postalCode: '06000', neighborhood: 'Centro', city: 'Ciudad de México', state: 'CMX', municipality: 'Cuauhtémoc' },
  { postalCode: '06100', neighborhood: 'Hipódromo', city: 'Ciudad de México', state: 'CMX', municipality: 'Cuauhtémoc' },
  { postalCode: '06140', neighborhood: 'Condesa', city: 'Ciudad de México', state: 'CMX', municipality: 'Cuauhtémoc' },
  { postalCode: '06170', neighborhood: 'Hipódromo Condesa', city: 'Ciudad de México', state: 'CMX', municipality: 'Cuauhtémoc' },
  { postalCode: '06600', neighborhood: 'Juárez', city: 'Ciudad de México', state: 'CMX', municipality: 'Cuauhtémoc' },
  { postalCode: '06700', neighborhood: 'Roma Norte', city: 'Ciudad de México', state: 'CMX', municipality: 'Cuauhtémoc' },
  { postalCode: '06760', neighborhood: 'Roma Sur', city: 'Ciudad de México', state: 'CMX', municipality: 'Cuauhtémoc' },
  
  // Guadalajara
  { postalCode: '44100', neighborhood: 'Centro', city: 'Guadalajara', state: 'JAL', municipality: 'Guadalajara' },
  { postalCode: '44130', neighborhood: 'Americana', city: 'Guadalajara', state: 'JAL', municipality: 'Guadalajara' },
  { postalCode: '44140', neighborhood: 'Moderna', city: 'Guadalajara', state: 'JAL', municipality: 'Guadalajara' },
  { postalCode: '44150', neighborhood: 'Americana', city: 'Guadalajara', state: 'JAL', municipality: 'Guadalajara' },
  { postalCode: '44160', neighborhood: 'Americana', city: 'Guadalajara', state: 'JAL', municipality: 'Guadalajara' },
  { postalCode: '44170', neighborhood: 'Lafayette', city: 'Guadalajara', state: 'JAL', municipality: 'Guadalajara' },
  
  // Monterrey
  { postalCode: '64000', neighborhood: 'Centro', city: 'Monterrey', state: 'NLE', municipality: 'Monterrey' },
  { postalCode: '64010', neighborhood: 'Obispado', city: 'Monterrey', state: 'NLE', municipality: 'Monterrey' },
  { postalCode: '64020', neighborhood: 'Zona Centro', city: 'Monterrey', state: 'NLE', municipality: 'Monterrey' },
  { postalCode: '64030', neighborhood: 'Maria Luisa', city: 'Monterrey', state: 'NLE', municipality: 'Monterrey' },
  { postalCode: '64040', neighborhood: 'Independencia', city: 'Monterrey', state: 'NLE', municipality: 'Monterrey' },
  
  // Puebla
  { postalCode: '72000', neighborhood: 'Centro', city: 'Puebla', state: 'PUE', municipality: 'Puebla' },
  { postalCode: '72010', neighborhood: 'Analco', city: 'Puebla', state: 'PUE', municipality: 'Puebla' },
  { postalCode: '72020', neighborhood: 'El Carmen', city: 'Puebla', state: 'PUE', municipality: 'Puebla' },
  { postalCode: '72030', neighborhood: 'Santiago', city: 'Puebla', state: 'PUE', municipality: 'Puebla' },
  { postalCode: '72040', neighborhood: 'San Francisco', city: 'Puebla', state: 'PUE', municipality: 'Puebla' },
  
  // Cancún
  { postalCode: '77500', neighborhood: 'Centro', city: 'Cancún', state: 'ROO', municipality: 'Benito Juárez' },
  { postalCode: '77505', neighborhood: 'Supermanzana 2', city: 'Cancún', state: 'ROO', municipality: 'Benito Juárez' },
  { postalCode: '77506', neighborhood: 'Supermanzana 3', city: 'Cancún', state: 'ROO', municipality: 'Benito Juárez' },
  { postalCode: '77507', neighborhood: 'Supermanzana 4', city: 'Cancún', state: 'ROO', municipality: 'Benito Juárez' },
  { postalCode: '77508', neighborhood: 'Supermanzana 5', city: 'Cancún', state: 'ROO', municipality: 'Benito Juárez' },
];

export async function seedPostalCodes() {
  console.log('🌱 Seeding postal codes...');
  
  try {
    // Limpiar tabla existente
    await prisma.postalCode.deleteMany();
    
    // Insertar nuevos datos
    const result = await prisma.postalCode.createMany({
      data: postalCodesData.map(pc => ({
        ...pc,
        country: 'México'
      }))
    });
    
    console.log(`✅ Created ${result.count} postal codes`);
  } catch (error) {
    console.error('❌ Error seeding postal codes:', error);
    throw error;
  }
}