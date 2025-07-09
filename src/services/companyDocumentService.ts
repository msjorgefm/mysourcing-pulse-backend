import { PrismaClient, DocumentType, UserRole } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
const multer = require('multer');
import { Request } from 'express';

const prisma = new PrismaClient();

// Configuración de multer para la carga de archivos
const storage = multer.diskStorage({
  destination: async (req: any, file: any, cb: any) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'company-documents');
    await fs.mkdir(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/xml',
      'text/xml'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

export class CompanyDocumentService {
  static async uploadDocument(
    companyId: number,
    documentType: DocumentType,
    file: Express.Multer.File,
    uploadedBy: UserRole,
    uploadedByUserId: number,
    notes?: string
  ) {
    try {
      // Verificar si ya existe un documento de este tipo
      const existingDocument = await prisma.companyDocument.findFirst({
        where: {
          companyId,
          documentType,
          isActive: true
        }
      });

      // Si existe, desactivarlo
      if (existingDocument) {
        await prisma.companyDocument.update({
          where: { id: existingDocument.id },
          data: { isActive: false }
        });
      }

      // Crear el nuevo documento
      const document = await prisma.companyDocument.create({
        data: {
          companyId,
          documentType,
          fileName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy,
          uploadedByUserId,
          notes
        }
      });

      // Actualizar el checklist
      await this.updateChecklist(companyId, documentType, true);

      return document;
    } catch (error) {
      // Si hay error, eliminar el archivo subido
      if (file && file.path) {
        await fs.unlink(file.path).catch(() => {});
      }
      throw error;
    }
  }

  static async updateChecklist(companyId: number, documentType: DocumentType, value: boolean) {
    // Mapeo de tipos de documento a campos del checklist
    const fieldMap: Record<DocumentType, string> = {
      CONSTANCIA_SITUACION_FISCAL: 'constanciaSituacionFiscal',
      ALTA_PATRONAL: 'altaPatronal',
      ALTA_FONACOT: 'altaFonacot',
      SELLOS_DIGITALES: 'sellosDigitales',
      CATALOGO_TRABAJADORES: 'catalogoTrabajadores',
      PLANTILLA_INCIDENCIAS: 'plantillaIncidencias',
      IDENTIFICACION: 'identificacion',
      CUENTA_BANCARIA: 'cuentaBancaria',
      REPRESENTANTE_LEGAL: 'representanteLegal',
      ACTA_CONSTITUTIVA: 'actaConstitutiva'
    };

    const field = fieldMap[documentType];
    if (!field) return;

    // Crear o actualizar el checklist
    const checklist = await prisma.companyDocumentChecklist.upsert({
      where: { companyId },
      create: {
        companyId,
        [field]: value
      },
      update: {
        [field]: value
      }
    });

    // Verificar si todos los documentos están cargados
    const allUploaded = await this.checkAllDocumentsUploaded(companyId);
    
    if (allUploaded !== checklist.allDocumentsUploaded) {
      await prisma.companyDocumentChecklist.update({
        where: { companyId },
        data: { allDocumentsUploaded: allUploaded }
      });
    }

    return checklist;
  }

  static async checkAllDocumentsUploaded(companyId: number): Promise<boolean> {
    const checklist = await prisma.companyDocumentChecklist.findUnique({
      where: { companyId }
    });

    if (!checklist) return false;

    // Verificar documentos obligatorios
    const requiredDocuments = [
      checklist.constanciaSituacionFiscal,
      checklist.altaPatronal,
      checklist.sellosDigitales,
      checklist.catalogoTrabajadores
    ];

    return requiredDocuments.every(doc => doc === true);
  }

  static async getCompanyDocuments(companyId: number) {
    const documents = await prisma.companyDocument.findMany({
      where: {
        companyId,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return documents;
  }

  static async getDocumentChecklist(companyId: number) {
    const checklist = await prisma.companyDocumentChecklist.findUnique({
      where: { companyId }
    });

    if (!checklist) {
      // Crear checklist vacío si no existe
      return await prisma.companyDocumentChecklist.create({
        data: { companyId }
      });
    }

    return checklist;
  }

  static async deleteDocument(documentId: number, companyId: number) {
    const document = await prisma.companyDocument.findFirst({
      where: {
        id: documentId,
        companyId,
        isActive: true
      }
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    // Desactivar el documento
    await prisma.companyDocument.update({
      where: { id: documentId },
      data: { isActive: false }
    });

    // Actualizar el checklist
    await this.updateChecklist(companyId, document.documentType, false);

    // Intentar eliminar el archivo físico
    try {
      await fs.unlink(document.filePath);
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
    }

    return { success: true };
  }

  static async downloadDocument(documentId: number, companyId: number) {
    const document = await prisma.companyDocument.findFirst({
      where: {
        id: documentId,
        companyId,
        isActive: true
      }
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    // Verificar que el archivo existe
    try {
      await fs.access(document.filePath);
    } catch {
      throw new Error('Archivo no encontrado en el servidor');
    }

    return {
      filePath: document.filePath,
      fileName: document.fileName,
      mimeType: document.mimeType
    };
  }

  static async getDocumentsByType(companyId: number, documentType: DocumentType) {
    const documents = await prisma.companyDocument.findMany({
      where: {
        companyId,
        documentType,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return documents;
  }
}