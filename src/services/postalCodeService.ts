import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PostalCodeService {
  /**
   * Busca información de códigos postales
   * @param postalCode - Código postal parcial o completo
   * @returns Lista de códigos postales que coinciden
   */
  static async searchByPostalCode(postalCode: string) {
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
  static async getByPostalCode(postalCode: string) {
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
  static async getNeighborhoodsByPostalCode(postalCode: string) {
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

  /**
   * Crea un nuevo código postal si no existe
   * @param data - Datos del nuevo código postal
   * @returns El código postal creado o el existente
   */
  static async createPostalCodeIfNotExists(data: {
    postalCode: string;
    neighborhood: string;
    city: string;
    state: string;
    municipality?: string;
  }) {
    if (!data.postalCode || data.postalCode.length !== 5) {
      throw new Error('Código postal inválido');
    }

    // Verificar si ya existe
    const existing = await prisma.postalCode.findFirst({
      where: {
        postalCode: data.postalCode,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state
      }
    });

    if (existing) {
      return existing;
    }

    // Crear nuevo código postal
    const newPostalCode = await prisma.postalCode.create({
      data: {
        postalCode: data.postalCode,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        municipality: data.municipality || data.city,
        country: 'México',
        isActive: true
      }
    });

    return newPostalCode;
  }
}