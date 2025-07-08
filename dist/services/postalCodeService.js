"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostalCodeService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PostalCodeService {
    /**
     * Busca información de códigos postales
     * @param postalCode - Código postal parcial o completo
     * @returns Lista de códigos postales que coinciden
     */
    static async searchByPostalCode(postalCode) {
        if (!postalCode || postalCode.length < 2) {
            return [];
        }
        const postalCodes = await prisma.postalCode.findMany({
            where: {
                postalCode: {
                    startsWith: postalCode
                },
                isActive: true
            },
            select: {
                id: true,
                postalCode: true,
                neighborhood: true,
                city: true,
                state: true,
                municipality: true,
                country: true
            },
            orderBy: {
                postalCode: 'asc'
            },
            take: 10 // Limitar a 10 resultados para mejor rendimiento
        });
        return postalCodes;
    }
    /**
     * Obtiene información completa de un código postal específico
     * @param postalCode - Código postal exacto (5 dígitos)
     * @returns Información del código postal o null si no existe
     */
    static async getByPostalCode(postalCode) {
        if (!postalCode || postalCode.length !== 5) {
            return null;
        }
        const postalCodeData = await prisma.postalCode.findFirst({
            where: {
                postalCode: postalCode,
                isActive: true
            },
            select: {
                id: true,
                postalCode: true,
                neighborhood: true,
                city: true,
                state: true,
                municipality: true,
                country: true
            }
        });
        return postalCodeData;
    }
    /**
     * Obtiene todos los colonias/barrios para un código postal
     * @param postalCode - Código postal exacto (5 dígitos)
     * @returns Lista de colonias disponibles
     */
    static async getNeighborhoodsByPostalCode(postalCode) {
        if (!postalCode || postalCode.length !== 5) {
            return [];
        }
        const neighborhoods = await prisma.postalCode.findMany({
            where: {
                postalCode: postalCode,
                isActive: true
            },
            select: {
                id: true,
                neighborhood: true
            },
            distinct: ['neighborhood'],
            orderBy: {
                neighborhood: 'asc'
            }
        });
        return neighborhoods;
    }
}
exports.PostalCodeService = PostalCodeService;
//# sourceMappingURL=postalCodeService.js.map