import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Temporary type definitions until Prisma generates them
type IncidenceCategory = 'DEDUCCION' | 'PERCEPCION';

interface CreateIncidenceTypeData {
  codigo: string;
  nombre: string;
  tipo: IncidenceCategory;
  descripcion?: string;
  activo?: boolean;
}

interface CreateTemplateData {
  nombre: string;
  headerRow: number;
  columnMappings: any;
  incidenceTypes: CreateIncidenceTypeData[];
}

class CompanyIncidenceTypeService {
  async getByCompany(companyId: number) {
    try {
      const types = await (prisma as any).companyIncidenceType.findMany({
        where: {
          companyId,
          activo: true
        },
        orderBy: [
          { tipo: 'asc' },
          { nombre: 'asc' }
        ]
      });
      
      return types;
    } catch (error) {
      console.error('Error getting company incidence types:', error);
      throw error;
    }
  }

  async create(companyId: number, data: CreateIncidenceTypeData) {
    try {
      // Verificar si ya existe un tipo con el mismo código para esta empresa
      const existing = await (prisma as any).companyIncidenceType.findUnique({
        where: {
          companyId_codigo: {
            companyId,
            codigo: data.codigo
          }
        }
      });

      if (existing) {
        throw new Error(`Ya existe un tipo de incidencia con el código ${data.codigo}`);
      }

      const type = await (prisma as any).companyIncidenceType.create({
        data: {
          companyId,
          ...data
        }
      });

      return type;
    } catch (error) {
      console.error('Error creating company incidence type:', error);
      throw error;
    }
  }

  async update(typeId: number, data: Partial<CreateIncidenceTypeData>) {
    try {
      const type = await (prisma as any).companyIncidenceType.update({
        where: { id: typeId },
        data
      });

      return type;
    } catch (error) {
      console.error('Error updating company incidence type:', error);
      throw error;
    }
  }

  async delete(typeId: number) {
    try {
      // Verificar si hay incidencias usando este tipo
      const incidences = await prisma.incidence.count({
        where: { customTypeId: typeId } as any
      });

      if (incidences > 0) {
        throw new Error('No se puede eliminar este tipo porque hay incidencias que lo están usando');
      }

      await (prisma as any).companyIncidenceType.delete({
        where: { id: typeId }
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting company incidence type:', error);
      throw error;
    }
  }

  async saveTemplate(companyId: number, templateData: CreateTemplateData) {
    try {
      return await prisma.$transaction(async (tx: any) => {
        // 1. Crear o actualizar la plantilla
        const template = await tx.companyIncidenceTemplate.upsert({
          where: { companyId },
          create: {
            companyId,
            nombre: templateData.nombre,
            headerRow: templateData.headerRow,
            mappings: templateData.columnMappings
          },
          update: {
            nombre: templateData.nombre,
            headerRow: templateData.headerRow,
            mappings: templateData.columnMappings,
            updatedAt: new Date()
          }
        });

        // 2. Desactivar tipos anteriores que no estén en la nueva lista
        const newCodes = templateData.incidenceTypes.map(t => t.codigo);
        await tx.companyIncidenceType.updateMany({
          where: {
            companyId,
            codigo: { notIn: newCodes }
          },
          data: { activo: false }
        });

        // 3. Crear o actualizar los tipos de incidencia
        const types = [];
        for (const typeData of templateData.incidenceTypes) {
          const type = await tx.companyIncidenceType.upsert({
            where: {
              companyId_codigo: {
                companyId,
                codigo: typeData.codigo
              }
            },
            create: {
              companyId,
              ...typeData,
              activo: true
            },
            update: {
              nombre: typeData.nombre,
              tipo: typeData.tipo,
              descripcion: typeData.descripcion,
              activo: true
            }
          });
          types.push(type);
        }

        return {
          template,
          types
        };
      });
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  async getTemplate(companyId: number) {
    try {
      const template = await (prisma as any).companyIncidenceTemplate.findUnique({
        where: { companyId },
        include: {
          company: {
            include: {
              incidenceTypes: {
                where: { activo: true },
                orderBy: [
                  { tipo: 'asc' },
                  { nombre: 'asc' }
                ]
              }
            }
          }
        }
      });

      if (!template) {
        return null;
      }

      return {
        ...template,
        types: template.company.incidenceTypes
      };
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  }
}

export const companyIncidenceTypeService = new CompanyIncidenceTypeService();