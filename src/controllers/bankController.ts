import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const bankController = {
  // Obtener todos los bancos activos con opción de búsqueda
  async getAll(req: Request, res: Response) {
    try {
      const { search } = req.query;
      
      // Si no hay término de búsqueda, devolver array vacío
      if (!search || typeof search !== 'string' || search.trim() === '') {
        return res.json([]);
      }
      
      // Filtrar por nombreCorto, nombre o codigo
      const whereClause: Prisma.BankWhereInput = {
        AND: [
          { activo: true },
          {
            OR: [
              { nombreCorto: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              { nombre: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              { codigo: { contains: search } }
            ]
          }
        ]
      };
      
      const banks = await prisma.bank.findMany({
        where: whereClause,
        orderBy: { nombreCorto: 'asc' },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          nombreCorto: true
        }
      });
      res.json(banks);
    } catch (error) {
      console.error('Error fetching banks:', error);
      res.status(500).json({ error: 'Error al obtener el catálogo de bancos' });
    }
  },

  // Buscar bancos por nombre
  async search(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
      }

      const banks = await prisma.bank.findMany({
        where: {
          AND: [
            { activo: true },
            {
              OR: [
                { nombreCorto: { contains: q, mode: 'insensitive' } }              ]
            }
          ]
        },
        orderBy: { nombreCorto: 'asc' },
        select: {
          id: true,
          codigo: true,
          nombre: true,
          nombreCorto: true
        }
      });

      res.json(banks);
    } catch (error) {
      console.error('Error searching banks:', error);
      res.status(500).json({ error: 'Error al buscar bancos' });
    }
  }
};