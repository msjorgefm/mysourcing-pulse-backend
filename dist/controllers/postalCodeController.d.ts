import { Request, Response } from 'express';
export declare const postalCodeController: {
    /**
     * Busca códigos postales por coincidencia parcial
     * GET /api/postal-codes/search?q=68240
     */
    search(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Obtiene información de un código postal específico
     * GET /api/postal-codes/:postalCode
     */
    getByCode(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Obtiene las colonias disponibles para un código postal
     * GET /api/postal-codes/:postalCode/neighborhoods
     */
    getNeighborhoods(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=postalCodeController.d.ts.map