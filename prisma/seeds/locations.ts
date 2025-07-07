import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedLocations() {
  console.log('Seeding location data...');

  // Sample data for major cities in Mexico
  // This is a simplified version - in production, you would load this from a complete SEPOMEX database
  const locationData = [
    {
      state: { code: 'CMX', name: 'Ciudad de México', abbreviation: 'CDMX' },
      municipios: [
        {
          code: 'CMX-01',
          name: 'Álvaro Obregón',
          ciudades: ['Ciudad de México'],
          colonias: [
            { name: 'San Ángel', postalCode: '01000' },
            { name: 'Chimalistac', postalCode: '01070' },
            { name: 'Florida', postalCode: '01030' }
          ]
        },
        {
          code: 'CMX-02',
          name: 'Azcapotzalco',
          ciudades: ['Ciudad de México'],
          colonias: [
            { name: 'Centro de Azcapotzalco', postalCode: '02000' },
            { name: 'San Rafael', postalCode: '02010' },
            { name: 'Santo Tomás', postalCode: '02020' }
          ]
        },
        {
          code: 'CMX-03',
          name: 'Benito Juárez',
          ciudades: ['Ciudad de México'],
          colonias: [
            { name: 'Del Valle Centro', postalCode: '03100' },
            { name: 'Narvarte Poniente', postalCode: '03020' },
            { name: 'Portales Sur', postalCode: '03300' }
          ]
        },
        {
          code: 'CMX-04',
          name: 'Coyoacán',
          ciudades: ['Ciudad de México'],
          colonias: [
            { name: 'Del Carmen', postalCode: '04100' },
            { name: 'Villa Coyoacán', postalCode: '04000' }
          ]
        },
        {
          code: 'CMX-05',
          name: 'Gustavo A. Madero',
          ciudades: ['Ciudad de México'],
          colonias: [
            { name: 'Lindavista', postalCode: '07300' },
            { name: 'Industrial', postalCode: '07800' }
          ]
        },
        {
          code: 'CMX-16',
          name: 'Miguel Hidalgo',
          ciudades: ['Ciudad de México'],
          colonias: [
            { name: 'Polanco', postalCode: '11560' },
            { name: 'Lomas de Chapultepec', postalCode: '11000' }
          ]
        },
        {
          code: 'CMX-12',
          name: 'Tlalpan',
          ciudades: ['Ciudad de México'],
          colonias: [
            { name: 'San Lorenzo Huipulco', postalCode: '14370' },
            { name: 'Villa Coapa', postalCode: '14390' }
          ]
        }
      ]
    },
    {
      state: { code: 'JAL', name: 'Jalisco', abbreviation: 'JAL' },
      municipios: [
        {
          code: 'JAL-01',
          name: 'Guadalajara',
          ciudades: ['Guadalajara'],
          colonias: [
            { name: 'Centro', postalCode: '44100' },
            { name: 'Americana', postalCode: '44160' },
            { name: 'Providencia', postalCode: '44630' }
          ]
        },
        {
          code: 'JAL-02',
          name: 'Zapopan',
          ciudades: ['Zapopan'],
          colonias: [
            { name: 'Valle Real', postalCode: '45019' },
            { name: 'Puerta de Hierro', postalCode: '45116' },
            { name: 'Ciudad Granja', postalCode: '45010' }
          ]
        },
        {
          code: 'JAL-03',
          name: 'Tlaquepaque',
          ciudades: ['Tlaquepaque'],
          colonias: [
            { name: 'Centro', postalCode: '45500' },
            { name: 'Las Juntas', postalCode: '45560' }
          ]
        }
      ]
    },
    {
      state: { code: 'NLE', name: 'Nuevo León', abbreviation: 'N.L.' },
      municipios: [
        {
          code: 'NLE-01',
          name: 'Monterrey',
          ciudades: ['Monterrey'],
          colonias: [
            { name: 'Centro', postalCode: '64000' },
            { name: 'Obispado', postalCode: '64060' },
            { name: 'Del Valle', postalCode: '66220' }
          ]
        },
        {
          code: 'NLE-02',
          name: 'San Pedro Garza García',
          ciudades: ['San Pedro Garza García'],
          colonias: [
            { name: 'Del Valle', postalCode: '66220' },
            { name: 'Fuentes del Valle', postalCode: '66226' },
            { name: 'Valle Oriente', postalCode: '66269' }
          ]
        },
        {
          code: 'NLE-03',
          name: 'Guadalupe',
          ciudades: ['Guadalupe'],
          colonias: [
            { name: 'Centro', postalCode: '67100' },
            { name: 'Contry', postalCode: '67140' }
          ]
        },
        {
          code: 'NLE-04',
          name: 'San Nicolás de los Garza',
          ciudades: ['San Nicolás de los Garza'],
          colonias: [
            { name: 'Anáhuac', postalCode: '66450' },
            { name: 'Las Puentes', postalCode: '66460' }
          ]
        }
      ]
    },
    {
      state: { code: 'OAX', name: 'Oaxaca', abbreviation: 'Oax.' },
      municipios: [
        {
          code: 'OAX-01',
          name: 'Oaxaca de Juárez',
          ciudades: ['Oaxaca de Juárez'],
          colonias: [
            { name: 'Centro', postalCode: '68000' },
            { name: 'Reforma', postalCode: '68050' },
            { name: 'América', postalCode: '68030' }
          ]
        },
        {
          code: 'OAX-02',
          name: 'Santa Cruz Xoxocotlán',
          ciudades: ['Santa Cruz Xoxocotlán'],
          colonias: [
            { name: 'Centro', postalCode: '71230' },
            { name: 'El Rosario', postalCode: '71233' }
          ]
        }
      ]
    },
    {
      state: { code: 'MEX', name: 'Estado de México', abbreviation: 'Mex.' },
      municipios: [
        {
          code: 'MEX-01',
          name: 'Ecatepec de Morelos',
          ciudades: ['Ecatepec de Morelos'],
          colonias: [
            { name: 'San Cristóbal Centro', postalCode: '55000' },
            { name: 'Guadalupe Victoria', postalCode: '55010' }
          ]
        },
        {
          code: 'MEX-02',
          name: 'Nezahualcóyotl',
          ciudades: ['Nezahualcóyotl'],
          colonias: [
            { name: 'Centro', postalCode: '57000' },
            { name: 'Benito Juárez', postalCode: '57130' }
          ]
        },
        {
          code: 'MEX-03',
          name: 'Toluca',
          ciudades: ['Toluca'],
          colonias: [
            { name: 'Centro', postalCode: '50000' },
            { name: 'La Merced', postalCode: '50080' }
          ]
        },
        {
          code: 'MEX-04',
          name: 'Naucalpan de Juárez',
          ciudades: ['Naucalpan de Juárez'],
          colonias: [
            { name: 'San Bartolo Centro', postalCode: '53000' },
            { name: 'Satélite', postalCode: '53100' }
          ]
        }
      ]
    },
    {
      state: { code: 'PUE', name: 'Puebla', abbreviation: 'Pue.' },
      municipios: [
        {
          code: 'PUE-01',
          name: 'Puebla',
          ciudades: ['Puebla'],
          colonias: [
            { name: 'Centro', postalCode: '72000' },
            { name: 'La Paz', postalCode: '72160' }
          ]
        }
      ]
    },
    {
      state: { code: 'YUC', name: 'Yucatán', abbreviation: 'Yuc.' },
      municipios: [
        {
          code: 'YUC-01',
          name: 'Mérida',
          ciudades: ['Mérida'],
          colonias: [
            { name: 'Centro', postalCode: '97000' },
            { name: 'García Ginerés', postalCode: '97070' }
          ]
        }
      ]
    }
  ];

  // Create states if they don't exist
  for (const data of locationData) {
    const state = await prisma.state.upsert({
      where: { code: data.state.code },
      update: {},
      create: {
        code: data.state.code,
        name: data.state.name,
        abbreviation: data.state.abbreviation
      }
    });

    // Create municipios
    for (const municipioData of data.municipios) {
      const municipio = await prisma.municipio.upsert({
        where: { code: municipioData.code },
        update: {},
        create: {
          code: municipioData.code,
          name: municipioData.name,
          stateCode: state.code
        }
      });

      // Create ciudades
      for (const ciudadName of municipioData.ciudades) {
        await prisma.ciudad.create({
          data: {
            name: ciudadName,
            municipioCode: municipio.code,
            stateCode: state.code
          }
        });
      }

      // Create colonias
      for (const coloniaData of municipioData.colonias) {
        await prisma.colonia.create({
          data: {
            name: coloniaData.name,
            postalCode: coloniaData.postalCode,
            cityName: municipioData.ciudades[0], // Using first city for simplicity
            municipioCode: municipio.code,
            stateCode: state.code
          }
        });
      }
    }
  }

  console.log('Location data seeded successfully!');
}