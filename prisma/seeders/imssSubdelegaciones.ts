import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedIMSSSubdelegaciones = async () => {
  console.log('🌱 Seeding IMSS Subdelegaciones...');

  // Primero obtenemos las delegaciones para asociar las subdelegaciones
  const delegaciones = await prisma.iMSSDelegacion.findMany();
  const delegacionMap = new Map(delegaciones.map(d => [d.codigo, d.id]));

  // Subdelegaciones principales del Sistema Nacional de Incorporación y Recaudación del IMSS
  const subdelegaciones = [
    // Ciudad de México Norte (09)
    { codigo: '091', nombre: 'Azcapotzalco', delegacionId: delegacionMap.get('09'), municipioCode: 'CMX-02' },
    { codigo: '092', nombre: 'Gustavo A. Madero', delegacionId: delegacionMap.get('09'), municipioCode: 'CMX-05' },
    { codigo: '093', nombre: 'Miguel Hidalgo', delegacionId: delegacionMap.get('09'), municipioCode: 'CMX-16' },
    
    // Ciudad de México Sur (10)
    { codigo: '101', nombre: 'Benito Juárez', delegacionId: delegacionMap.get('10'), municipioCode: 'CMX-03' },
    { codigo: '102', nombre: 'Coyoacán', delegacionId: delegacionMap.get('10'), municipioCode: 'CMX-04' },
    { codigo: '103', nombre: 'Tlalpan', delegacionId: delegacionMap.get('10'), municipioCode: 'CMX-12' },
    
    // Jalisco (15)
    { codigo: '151', nombre: 'Guadalajara', delegacionId: delegacionMap.get('15'), municipioCode: 'JAL-01' },
    { codigo: '152', nombre: 'Zapopan', delegacionId: delegacionMap.get('15'), municipioCode: 'JAL-02' },
    { codigo: '153', nombre: 'Tlaquepaque', delegacionId: delegacionMap.get('15'), municipioCode: 'JAL-03' },
    
    // Nuevo León (21)
    { codigo: '211', nombre: 'Monterrey', delegacionId: delegacionMap.get('21'), municipioCode: 'NLE-01' },
    { codigo: '212', nombre: 'San Nicolás de los Garza', delegacionId: delegacionMap.get('21'), municipioCode: 'NLE-04' },
    { codigo: '213', nombre: 'Guadalupe', delegacionId: delegacionMap.get('21'), municipioCode: 'NLE-03' },
    
    // Estado de México Oriente (16)
    { codigo: '161', nombre: 'Ecatepec', delegacionId: delegacionMap.get('16'), municipioCode: 'MEX-01' },
    { codigo: '162', nombre: 'Nezahualcóyotl', delegacionId: delegacionMap.get('16'), municipioCode: 'MEX-02' },
    
    // Estado de México Poniente (17)
    { codigo: '171', nombre: 'Toluca', delegacionId: delegacionMap.get('17'), municipioCode: 'MEX-03' },
    { codigo: '172', nombre: 'Naucalpan', delegacionId: delegacionMap.get('17'), municipioCode: 'MEX-04' },
    
    // Puebla (23)
    { codigo: '231', nombre: 'Puebla', delegacionId: delegacionMap.get('23'), municipioCode: 'PUE-01' },
    
    // Yucatán (35)
    { codigo: '351', nombre: 'Mérida', delegacionId: delegacionMap.get('35'), municipioCode: 'YUC-01' },
    
    // Oaxaca (22)
    { codigo: '221', nombre: 'Oaxaca de Juárez', delegacionId: delegacionMap.get('22'), municipioCode: 'OAX-01' },
    { codigo: '222', nombre: 'Salina Cruz', delegacionId: delegacionMap.get('22'), municipioCode: 'OAX-02' },
  ];

  // Solo crear subdelegaciones que tengan delegacionId y municipioCode válidos
  for (const subdelegacion of subdelegaciones) {
    if (subdelegacion.delegacionId && subdelegacion.municipioCode) {
      try {
        await prisma.iMSSSubdelegacion.upsert({
          where: { codigo: subdelegacion.codigo },
          update: {},
          create: {
            codigo: subdelegacion.codigo,
            nombre: subdelegacion.nombre,
            delegacionId: subdelegacion.delegacionId,
            municipioCode: subdelegacion.municipioCode,
          },
        });
        console.log(`✅ Subdelegación ${subdelegacion.nombre} creada`);
      } catch (error) {
        console.error(`❌ Error creando subdelegación ${subdelegacion.nombre}:`, error);
      }
    }
  }

  console.log('✅ IMSS Subdelegaciones seeded successfully');
};

// If run directly
if (require.main === module) {
  seedIMSSSubdelegaciones()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}