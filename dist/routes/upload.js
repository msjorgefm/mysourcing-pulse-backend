"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const auth_1 = require("../middleware/auth");
// Importar multer usando require para compatibilidad con Docker
const multer = require('multer');
const router = (0, express_1.Router)();
// Configuración de multer para almacenar archivos
const storage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), 'resources', 'certificates');
        try {
            // Asegurarse de que el directorio existe
            await promises_1.default.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        }
        catch (error) {
            cb(error, '');
        }
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    },
    fileFilter: (_req, file, cb) => {
        const allowedExtensions = ['.cer', '.key'];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de archivo no permitido. Solo se aceptan archivos .cer y .key'));
        }
    }
});
// Todas las rutas requieren autenticación
router.use(auth_1.authenticate);
// Endpoint para subir certificados
router.post('/upload/certificate', upload.fields([
    { name: 'certificate', maxCount: 1 },
    { name: 'key', maxCount: 1 }
]), async (req, res) => {
    try {
        // Cast req to any para acceder a files
        const files = req.files;
        if (!files) {
            res.status(400).json({
                success: false,
                error: 'No se enviaron archivos'
            });
            return;
        }
        const response = {};
        if (files.certificate && files.certificate[0]) {
            response.certificateFile = files.certificate[0].filename;
            response.certificatePath = files.certificate[0].filename;
        }
        if (files.key && files.key[0]) {
            response.keyFile = files.key[0].filename;
            response.keyPath = files.key[0].filename;
        }
        res.json({
            success: true,
            files: response
        });
    }
    catch (error) {
        console.error('Error uploading certificates:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al subir los archivos'
        });
    }
});
// Endpoint para descargar certificados
router.get('/download/certificate/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path_1.default.join(process.cwd(), 'resources', 'certificates', filename);
        // Verificar que el archivo existe
        await promises_1.default.access(filePath);
        res.download(filePath);
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: 'Archivo no encontrado'
        });
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map