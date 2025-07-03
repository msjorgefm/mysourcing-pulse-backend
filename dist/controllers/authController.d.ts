import { Request, Response } from 'express';
export declare class AuthController {
    static login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static refreshToken(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static logout(req: Request, res: Response): Promise<void>;
    static register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static getProfile(req: any, res: Response): Promise<void>;
}
//# sourceMappingURL=authController.d.ts.map