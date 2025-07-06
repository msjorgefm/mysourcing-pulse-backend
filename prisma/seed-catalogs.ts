import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCatalogs() {
  // Seed Tax Regimes
  const taxRegimes = [
    // Personas Morales
    { code: '601', name: 'General de Ley Personas Morales', tipoPersona: 'MORAL' },
    { code: '603', name: 'Personas Morales con Fines no Lucrativos', tipoPersona: 'MORAL' },
    { code: '607', name: 'Régimen de Enajenación o Adquisición de Bienes', tipoPersona: 'MORAL' },
    { code: '609', name: 'Consolidación', tipoPersona: 'MORAL' },
    { code: '610', name: 'Residentes en el Extranjero sin Establecimiento Permanente en México', tipoPersona: 'MORAL' },
    { code: '622', name: 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras', tipoPersona: 'MORAL' },
    { code: '623', name: 'Opcional para Grupos de Sociedades', tipoPersona: 'MORAL' },
    { code: '624', name: 'Coordinados', tipoPersona: 'MORAL' },
    { code: '628', name: 'Hidrocarburos', tipoPersona: 'MORAL' },
    
    // Personas Físicas
    { code: '605', name: 'Sueldos y Salarios e Ingresos Asimilados a Salarios', tipoPersona: 'FISICA' },
    { code: '606', name: 'Arrendamiento', tipoPersona: 'FISICA' },
    { code: '608', name: 'Demás ingresos', tipoPersona: 'FISICA' },
    { code: '611', name: 'Ingresos por Dividendos (socios y accionistas)', tipoPersona: 'FISICA' },
    { code: '612', name: 'Personas Físicas con Actividades Empresariales y Profesionales', tipoPersona: 'FISICA' },
    { code: '614', name: 'Ingresos por intereses', tipoPersona: 'FISICA' },
    { code: '615', name: 'Régimen de los ingresos por obtención de premios', tipoPersona: 'FISICA' },
    { code: '616', name: 'Sin obligaciones fiscales', tipoPersona: 'FISICA' },
    { code: '621', name: 'Incorporación Fiscal', tipoPersona: 'FISICA' },
    { code: '625', name: 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas', tipoPersona: 'FISICA' },
    { code: '626', name: 'Régimen Simplificado de Confianza', tipoPersona: 'FISICA' },
  ];

  for (const regime of taxRegimes) {
    await prisma.taxRegime.upsert({
      where: { code: regime.code },
      update: {},
      create: regime,
    });
  }

  // Seed Economic Activities
  const economicActivities = [
    { code: '11', name: 'Agricultura, cría y explotación de animales, aprovechamiento forestal, pesca y caza' },
    { code: '21', name: 'Minería' },
    { code: '22', name: 'Generación, transmisión, distribución y comercialización de energía eléctrica, suministro de agua y de gas' },
    { code: '23', name: 'Construcción' },
    { code: '31-33', name: 'Industrias manufactureras' },
    { code: '43', name: 'Comercio al por mayor' },
    { code: '46', name: 'Comercio al por menor' },
    { code: '48-49', name: 'Transportes, correos y almacenamiento' },
    { code: '51', name: 'Información en medios masivos' },
    { code: '52', name: 'Servicios financieros y de seguros' },
    { code: '53', name: 'Servicios inmobiliarios y de alquiler de bienes muebles e intangibles' },
    { code: '54', name: 'Servicios profesionales, científicos y técnicos' },
    { code: '55', name: 'Corporativos' },
    { code: '56', name: 'Servicios de apoyo a los negocios y manejo de residuos, y servicios de remediación' },
    { code: '61', name: 'Servicios educativos' },
    { code: '62', name: 'Servicios de salud y de asistencia social' },
    { code: '71', name: 'Servicios de esparcimiento culturales y deportivos, y otros servicios recreativos' },
    { code: '72', name: 'Servicios de alojamiento temporal y de preparación de alimentos y bebidas' },
    { code: '81', name: 'Otros servicios excepto actividades gubernamentales' },
    { code: '93', name: 'Actividades legislativas, gubernamentales, de impartición de justicia y de organismos internacionales' },
  ];

  for (const activity of economicActivities) {
    await prisma.economicActivity.upsert({
      where: { code: activity.code },
      update: {},
      create: activity,
    });
  }

  console.log('Catalogs seeded successfully!');
}

seedCatalogs()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });