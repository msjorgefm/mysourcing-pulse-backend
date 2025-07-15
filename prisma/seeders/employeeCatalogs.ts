import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedEmployeeCatalogs() {
  console.log('🌱 Seeding employee catalogs...');

  // Seed Modalidad de Trabajo
  const modalidadTrabajo = [
    { codigo: 'PRESENCIAL', nombre: 'Presencial', descripcion: 'Trabajo en las instalaciones de la empresa' },
    { codigo: 'TELETRABAJO', nombre: 'Teletrabajo', descripcion: 'Trabajo remoto desde casa' },
    { codigo: 'MIXTO', nombre: 'Mixto', descripcion: 'Combinación de presencial y remoto' }
  ];

  for (const modalidad of modalidadTrabajo) {
    await prisma.catalogoModalidadTrabajo.upsert({
      where: { codigo: modalidad.codigo },
      update: {},
      create: modalidad
    });
  }
  console.log('✅ Modalidad de trabajo catalog seeded');

  // Seed Tipo de Jornada
  const tipoJornada = [
    { codigo: 'DIURNA', nombre: 'Diurna', descripcion: 'Jornada de trabajo diurna' },
    { codigo: 'NOCTURNA', nombre: 'Nocturna', descripcion: 'Jornada de trabajo nocturna' },
    { codigo: 'MIXTA', nombre: 'Mixta', descripcion: 'Jornada de trabajo mixta' }
  ];

  for (const jornada of tipoJornada) {
    await prisma.catalogoTipoJornada.upsert({
      where: { codigo: jornada.codigo },
      update: {},
      create: jornada
    });
  }
  console.log('✅ Tipo de jornada catalog seeded');

  // Seed Situación Contractual
  const situacionContractual = [
    { codigo: 'PERMANENTE', nombre: 'Permanente', descripcion: 'Trabajador permanente' },
    { codigo: 'EVENTUAL', nombre: 'Eventual', descripcion: 'Trabajador eventual' },
    { codigo: 'EVENTUAL_CONSTRUCCION', nombre: 'Eventual Construcción', descripcion: 'Trabajador eventual en construcción' },
    { codigo: 'EVENTUAL_CAMPO', nombre: 'Eventual Campo', descripcion: 'Trabajador eventual en campo' }
  ];

  for (const situacion of situacionContractual) {
    await prisma.catalogoSituacionContractual.upsert({
      where: { codigo: situacion.codigo },
      update: {},
      create: situacion
    });
  }
  console.log('✅ Situación contractual catalog seeded');

  // Seed Tipo de Trabajador
  const tipoTrabajador = [
    { codigo: 'CONFIANZA', nombre: 'Confianza', descripcion: 'Trabajador de confianza' },
    { codigo: 'PRACTICANTE', nombre: 'Practicante', descripcion: 'Practicante o aprendiz' }
  ];

  for (const tipo of tipoTrabajador) {
    await prisma.catalogoTipoTrabajador.upsert({
      where: { codigo: tipo.codigo },
      update: {},
      create: tipo
    });
  }
  console.log('✅ Tipo de trabajador catalog seeded');

  // Seed Tipo de Salario
  const tipoSalario = [
    { codigo: 'FIJO', nombre: 'Fijo', descripcion: 'Salario fijo mensual' },
    { codigo: 'MIXTO', nombre: 'Mixto', descripcion: 'Salario mixto (fijo + variable)' },
    { codigo: 'VARIABLE', nombre: 'Variable', descripcion: 'Salario variable' }
  ];

  for (const salario of tipoSalario) {
    await prisma.catalogoTipoSalario.upsert({
      where: { codigo: salario.codigo },
      update: {},
      create: salario
    });
  }
  console.log('✅ Tipo de salario catalog seeded');

  // Seed Zona Geográfica
  const zonaGeografica = [
    { codigo: 'RESTO_PAIS', nombre: 'Resto del País', descripcion: 'Zona general del país' },
    { codigo: 'ZONA_FRONTERA_NORTE', nombre: 'Zona Frontera Norte', descripcion: 'Zona fronteriza norte con beneficios fiscales' }
  ];

  for (const zona of zonaGeografica) {
    await prisma.catalogoZonaGeografica.upsert({
      where: { codigo: zona.codigo },
      update: {},
      create: zona
    });
  }
  console.log('✅ Zona geográfica catalog seeded');

  // Seed Tipo de Contrato (con valores en español)
  const tipoContrato = [
    { codigo: 'INDEFINIDO', nombre: 'Indefinido', descripcion: 'Contrato por tiempo indefinido' },
    { codigo: 'TIEMPO_DETERMINADO', nombre: 'Tiempo Determinado', descripcion: 'Contrato por tiempo determinado' },
    { codigo: 'MEDIO_TIEMPO', nombre: 'Medio Tiempo', descripcion: 'Contrato de medio tiempo' },
    { codigo: 'CONTRATISTA', nombre: 'Contratista', descripcion: 'Contrato por servicios profesionales' },
    { codigo: 'PRACTICANTE', nombre: 'Practicante', descripcion: 'Contrato de prácticas profesionales' }
  ];

  for (const contrato of tipoContrato) {
    await prisma.catalogoTipoContrato.upsert({
      where: { codigo: contrato.codigo },
      update: {},
      create: contrato
    });
  }
  console.log('✅ Tipo de contrato catalog seeded');

  // Seed Régimen de Contratación
  const regimenContratacion = [
    { codigo: 'SUELDOS', nombre: 'Sueldos (Incluye fracc. I del art. 94 de LISR)', descripcion: 'Sueldos y salarios regulares' },
    { codigo: 'JUBILADOS', nombre: 'Jubilados', descripcion: 'Personal jubilado' },
    { codigo: 'ASIMILADOS_COOPERATIVAS', nombre: 'Asimilados Miembros sociedades Cooperativas Produc', descripcion: 'Miembros de sociedades cooperativas de producción' },
    { codigo: 'ASIMILADOS_SOCIEDADES', nombre: 'Asimilados Integrantes Sociedades Asociaciones Civ', descripcion: 'Integrantes de sociedades y asociaciones civiles' },
    { codigo: 'ASIMILADOS_CONSEJOS', nombre: 'Asimilados Miembros Consejos', descripcion: 'Miembros de consejos directivos' },
    { codigo: 'ASIMILADOS_COMISIONISTAS', nombre: 'Asimilados Comisionistas', descripcion: 'Trabajadores comisionistas' },
    { codigo: 'ASIMILADOS_HONORARIOS', nombre: 'Asimilados Honorarios', descripcion: 'Trabajadores por honorarios asimilados a salarios' },
    { codigo: 'ASIMILADOS_ACCIONES', nombre: 'Asimilados acciones', descripcion: 'Ingresos asimilados por acciones' },
    { codigo: 'ASIMILADOS_OTROS', nombre: 'Asimilados otros', descripcion: 'Otros ingresos asimilados a salarios' }
  ];

  for (const regimen of regimenContratacion) {
    await prisma.catalogoRegimenContratacion.upsert({
      where: { codigo: regimen.codigo },
      update: {},
      create: regimen
    });
  }
  console.log('✅ Régimen de contratación catalog seeded');

  console.log('✅ All employee catalogs seeded successfully!');
}