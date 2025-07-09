import { Request, Response } from 'express';
export declare const stateController: {
    /**
     * Obtiene todos los estados
     * GET /api/states
     */
    getAllStates(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * Obtiene un estado por su código
     * GET /api/states/:code
     */
    getStateByCode(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=stateController.d.ts.map