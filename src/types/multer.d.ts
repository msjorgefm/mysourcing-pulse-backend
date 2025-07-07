declare module 'multer' {
  import { Request, Response, NextFunction } from 'express';
  
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  interface MulterOptions {
    dest?: string;
    storage?: any;
    fileFilter?: (req: any, file: File, callback: (error: Error | null, acceptFile: boolean) => void) => void;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    preservePath?: boolean;
  }

  interface StorageEngine {
    _handleFile(req: any, file: any, callback: (error?: any, info?: any) => void): void;
    _removeFile(req: any, file: any, callback: (error: Error | null) => void): void;
  }

  interface DiskStorageOptions {
    destination?: string | ((req: any, file: File, callback: (error: Error | null, destination: string) => void) => void);
    filename?(req: any, file: File, callback: (error: Error | null, filename: string) => void): void;
  }

  interface Instance {
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: Array<{ name: string; maxCount?: number }>): any;
    none(): any;
    any(): any;
  }

  function memoryStorage(): StorageEngine;
  function diskStorage(options: DiskStorageOptions): StorageEngine;
  function multer(options?: MulterOptions): Instance;

  export = multer;
}