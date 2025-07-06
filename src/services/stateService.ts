import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class StateService {
  /**
   * Obtiene todos los estados activos
   * @returns Lista de estados ordenados alfabéticamente
   */
  static async getAllStates() {
    const states = await prisma.state.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        code: true,
        name: true,
        abbreviation: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return states;
  }

  /**
   * Obtiene un estado por su código
   * @param code - Código del estado (ej: 'OAX', 'CMX')
   * @returns Información del estado o null si no existe
   */
  static async getStateByCode(code: string) {
    const state = await prisma.state.findUnique({
      where: {
        code: code.toUpperCase()
      },
      select: {
        id: true,
        code: true,
        name: true,
        abbreviation: true
      }
    });

    return state;
  }
}