import { Request, Response } from 'express';
import { CompanyDocumentService, upload } from '../services/companyDocumentService';
import { DocumentType, UserRole } from '@prisma/client';
import path from 'path';

export class CompanyDocumentController {
  static uploadDocument = async (req: Request, res: Response) => {
    try {
      const { companyId, documentType } = req.params;
      const { notes } = req.body;
      const file = req.file;
      const user = (req as any).user;

      if (!file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
      }

      if (!Object.values(DocumentType).includes(documentType as DocumentType)) {
        return res.status(400).json({ error: 'Tipo de documento inválido' });
      }

      const document = await CompanyDocumentService.uploadDocument(
        parseInt(companyId),
        documentType as DocumentType,
        file,
        user.role as UserRole,
        user.id,
        notes
      );

      res.json({
        success: true,
        document
      });
    } catch (error: any) {
      console.error('Error al subir documento:', error);
      res.status(500).json({ 
        error: 'Error al subir el documento',
        message: error.message 
      });
    }
  };

  static getCompanyDocuments = async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      
      const documents = await CompanyDocumentService.getCompanyDocuments(
        parseInt(companyId)
      );

      res.json({
        success: true,
        documents
      });
    } catch (error: any) {
      console.error('Error al obtener documentos:', error);
      res.status(500).json({ 
        error: 'Error al obtener los documentos',
        message: error.message 
      });
    }
  };

  static getDocumentChecklist = async (req: Request, res: Response) => {
    try {
      const { companyId } = req.params;
      
      const checklist = await CompanyDocumentService.getDocumentChecklist(
        parseInt(companyId)
      );

      res.json({
        success: true,
        checklist
      });
    } catch (error: any) {
      console.error('Error al obtener checklist:', error);
      res.status(500).json({ 
        error: 'Error al obtener el checklist',
        message: error.message 
      });
    }
  };

  static deleteDocument = async (req: Request, res: Response) => {
    try {
      const { companyId, documentId } = req.params;
      
      const result = await CompanyDocumentService.deleteDocument(
        parseInt(documentId),
        parseInt(companyId)
      );

      res.json(result);
    } catch (error: any) {
      console.error('Error al eliminar documento:', error);
      res.status(500).json({ 
        error: 'Error al eliminar el documento',
        message: error.message 
      });
    }
  };

  static downloadDocument = async (req: Request, res: Response) => {
    try {
      const { companyId, documentId } = req.params;
      
      const fileInfo = await CompanyDocumentService.downloadDocument(
        parseInt(documentId),
        parseInt(companyId)
      );

      res.setHeader('Content-Type', fileInfo.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.fileName}"`);
      res.sendFile(path.resolve(fileInfo.filePath));
    } catch (error: any) {
      console.error('Error al descargar documento:', error);
      res.status(500).json({ 
        error: 'Error al descargar el documento',
        message: error.message 
      });
    }
  };

  static getDocumentsByType = async (req: Request, res: Response) => {
    try {
      const { companyId, documentType } = req.params;
      
      if (!Object.values(DocumentType).includes(documentType as DocumentType)) {
        return res.status(400).json({ error: 'Tipo de documento inválido' });
      }

      const documents = await CompanyDocumentService.getDocumentsByType(
        parseInt(companyId),
        documentType as DocumentType
      );

      res.json({
        success: true,
        documents
      });
    } catch (error: any) {
      console.error('Error al obtener documentos por tipo:', error);
      res.status(500).json({ 
        error: 'Error al obtener los documentos',
        message: error.message 
      });
    }
  };
}