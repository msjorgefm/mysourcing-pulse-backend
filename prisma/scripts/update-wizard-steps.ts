import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateWizardSteps() {
  try {
    console.log('🔄 Iniciando actualización de pasos del wizard...');

    // Obtener todas las empresas
    const companies = await prisma.company.findMany({
      include: {
        wizard: {
          include: {
            sectionProgress: {
              include: {
                steps: true
              }
            }
          }
        }
      }
    });

    for (const company of companies) {
      if (!company.wizard) {
        console.log(`⚠️  Empresa ${company.name} no tiene wizard, saltando...`);
        continue;
      }

      console.log(`📝 Procesando empresa: ${company.name}`);

      // Buscar sección 6 (Nómina)
      const seccionNomina = company.wizard.sectionProgress.find(s => s.sectionNumber === 6);
      if (seccionNomina) {
        // Eliminar paso "Configuración de Nómina" (stepNumber: 2)
        const pasoConfigNomina = seccionNomina.steps.find(
          step => step.stepNumber === 2 && step.stepName === 'Configuración de Nómina'
        );
        
        if (pasoConfigNomina) {
          await prisma.companyWizardStep.delete({
            where: { id: pasoConfigNomina.id }
          });
          console.log('  ✅ Eliminado paso "Configuración de Nómina"');
        }

        // Actualizar nombre del paso 1 si es necesario
        const pasoCalendario = seccionNomina.steps.find(step => step.stepNumber === 1);
        if (pasoCalendario && pasoCalendario.stepName === 'Calendario Laboral') {
          await prisma.companyWizardStep.update({
            where: { id: pasoCalendario.id },
            data: { stepName: 'Calendario' }
          });
          console.log('  ✅ Actualizado nombre de paso "Calendario Laboral" a "Calendario"');
        }
      }

      // Buscar sección 7 (Talento Humano)
      const seccionTalentoHumano = company.wizard.sectionProgress.find(s => s.sectionNumber === 7);
      if (seccionTalentoHumano) {
        // Eliminar todos los pasos existentes
        const pasosAEliminar = seccionTalentoHumano.steps.filter(
          step => step.stepName === 'Horarios' || step.stepName === 'Políticas'
        );

        for (const paso of pasosAEliminar) {
          await prisma.companyWizardStep.delete({
            where: { id: paso.id }
          });
          console.log(`  ✅ Eliminado paso "${paso.stepName}"`);
        }

        // Verificar si ya existe el paso "Alta Trabajadores"
        const pasoAltaTrabajadores = seccionTalentoHumano.steps.find(
          step => step.stepName === 'Alta Trabajadores'
        );

        if (!pasoAltaTrabajadores) {
          // Crear el nuevo paso "Alta Trabajadores"
          await prisma.companyWizardStep.create({
            data: {
              sectionId: seccionTalentoHumano.id,
              stepNumber: 1,
              stepName: 'Alta Trabajadores',
              isOptional: false,
              status: 'PENDING'
            }
          });
          console.log('  ✅ Creado paso "Alta Trabajadores"');
        }
      }
    }

    console.log('✅ Actualización completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
updateWizardSteps()
  .then(() => {
    console.log('Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });