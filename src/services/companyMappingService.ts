import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Directory for storing mapping configurations
const MAPPINGS_DIR = path.join(process.cwd(), 'data', 'mappings');

// Ensure the mappings directory exists
if (!fs.existsSync(MAPPINGS_DIR)) {
  fs.mkdirSync(MAPPINGS_DIR, { recursive: true });
}

interface MappingConfiguration {
  companyId: number;
  mode: 'simple' | 'advanced';
  sourceFile?: {
    name: string;
    headerRow: number;
    headers: string[];
  };
  targetFile?: {
    name: string;
    headerRow: number;
    headers: string[];
  };
  standardTemplate?: {
    name: string;
    headers: string[];
  };
  mappings?: {
    direct: Record<string, any>;
    transformations: Array<{
      id: number;
      sourceColumns: number[];
      nameTarget: string;
      valueTarget: string;
      typeValue: 'P' | 'D';
    }>;
    concepts?: Record<string, string>;
  };
}

class CompanyMappingService {
  async saveMapping(companyId: number, configuration: MappingConfiguration) {
    try {
      console.log('Saving mapping for company:', companyId);
      console.log('Configuration:', JSON.stringify(configuration, null, 2));
      
      // Verificar que la empresa existe
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });
      
      if (!company) {
        throw new Error(`Empresa con ID ${companyId} no encontrada`);
      }
      
      console.log('Company found:', company.name);
      
      // Por ahora guardamos en la tabla CompanyIncidenceTemplate
      // En el futuro se puede crear una tabla específica para mappings más complejos
      // Determinar el nombre basado en el modo
      const templateName = configuration.mode === 'simple' 
        ? configuration.standardTemplate?.name || 'Plantilla Estándar'
        : configuration.sourceFile?.name || 'Plantilla Personalizada';
        
      const headerRow = configuration.mode === 'simple'
        ? 1
        : configuration.sourceFile?.headerRow || 1;
      
      // Verificar si el modelo existe
      try {
        const result = await (prisma as any).companyIncidenceTemplate.upsert({
          where: { companyId },
          create: {
            companyId,
            nombre: templateName,
            headerRow: headerRow,
            mappings: configuration // Guardamos toda la configuración como JSON
          },
          update: {
            nombre: templateName,
            headerRow: headerRow,
            mappings: configuration
          }
        });
        
        console.log('Mapping saved successfully:', result);
        return result;
      } catch (prismaError) {
        console.error('Prisma error:', prismaError);
        
        // Fallback: guardar en archivo JSON
        console.log('Using file-based fallback method to save mapping...');
        
        const filePath = path.join(MAPPINGS_DIR, `company_${companyId}_mapping.json`);
        
        const mappingData = {
          id: companyId,
          companyId,
          nombre: templateName,
          headerRow: headerRow,
          mappings: configuration,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        fs.writeFileSync(filePath, JSON.stringify(mappingData, null, 2));
        
        console.log('Mapping saved to file:', filePath);
        return mappingData;
      }
    } catch (error) {
      console.error('Error saving mapping configuration:', error);
      console.error('Error details:', error instanceof Error ? error.stack : error);
      throw error;
    }
  }

  async getMapping(companyId: number) {
    try {
      // Intentar obtener de CompanyIncidenceTemplate primero
      try {
        const mapping = await (prisma as any).companyIncidenceTemplate.findUnique({
          where: { companyId }
        });

        if (mapping && mapping.mappings) {
          // Si mappings es un JSON con la estructura completa, lo devolvemos
          if (mapping.mappings.sourceFile || mapping.mappings.mode) {
            return mapping.mappings;
          }
        }
      } catch (prismaError) {
        console.log('CompanyIncidenceTemplate not available, checking file storage...');
      }

      // Fallback: buscar en archivo JSON
      const filePath = path.join(MAPPINGS_DIR, `company_${companyId}_mapping.json`);
      
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const mappingData = JSON.parse(fileContent);
        
        if (mappingData && mappingData.mappings) {
          return mappingData.mappings;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting mapping configuration:', error);
      throw error;
    }
  }

  async processExcelWithMapping(companyId: number, excelData: any[]) {
    try {
      const mappingConfig = await this.getMapping(companyId);
      if (!mappingConfig) {
        throw new Error('No se encontró configuración de mapeo para esta empresa');
      }

      const transformedData = [];
      
      // Si es modo simple, simplemente devolver los datos como están
      if (mappingConfig.mode === 'simple') {
        return excelData.slice(1); // Saltar la fila de encabezados
      }
      
      // Modo avanzado: procesar según el mapeo
      if (!mappingConfig.sourceFile || !mappingConfig.mappings) {
        throw new Error('Configuración incompleta para modo avanzado');
      }
      
      // Procesar cada fila del Excel
      for (let rowIndex = mappingConfig.sourceFile.headerRow; rowIndex < excelData.length; rowIndex++) {
        const row = excelData[rowIndex];
        
        // Aplicar mapeos directos
        const directMappedRow: any = {};
        for (const [sourceIdx, directMapping] of Object.entries(mappingConfig.mappings.direct)) {
          const sourceValue = row[parseInt(sourceIdx)];
          if (sourceValue) {
            directMappedRow[(directMapping as any).targetHeader] = sourceValue;
          }
        }

        // Aplicar transformaciones (múltiples columnas a filas)
        for (const rule of mappingConfig.mappings.transformations) {
          for (const sourceColumnIdx of rule.sourceColumns) {
            const sourceHeader = mappingConfig.sourceFile.headers[sourceColumnIdx];
            const sourceValue = row[sourceColumnIdx];
            
            if (sourceValue && sourceValue !== 0) {
              // Aplicar homologación de conceptos si existe
              let conceptName = sourceHeader;
              if (mappingConfig.mappings.concepts && mappingConfig.mappings.concepts[sourceHeader]) {
                conceptName = mappingConfig.mappings.concepts[sourceHeader];
              }
              
              const transformedRow = {
                ...directMappedRow,
                [mappingConfig.targetFile!.headers[parseInt(rule.nameTarget)]]: conceptName,
                [mappingConfig.targetFile!.headers[parseInt(rule.valueTarget)]]: sourceValue,
                tipo: rule.typeValue
              };
              transformedData.push(transformedRow);
            }
          }
        }
      }

      return transformedData;
    } catch (error) {
      console.error('Error processing Excel with mapping:', error);
      throw error;
    }
  }
}

export const companyMappingService = new CompanyMappingService();