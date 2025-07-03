import { Server as HTTPServer } from 'http';
export declare class SocketManager {
    private io;
    constructor(httpServer: HTTPServer);
    private setupMiddleware;
    private setupEventHandlers;
    broadcastToCompany(companyId: number, event: string, data: any): void;
    broadcastToRole(role: string, event: string, data: any): void;
    broadcastToPayroll(companyId: number, periodId: number, event: string, data: any): void;
    sendToUser(userId: number, event: string, data: any): void;
    getConnectedUsers(): number;
    getUsersInCompany(companyId: number): number;
}
export default SocketManager;
//# sourceMappingURL=socket.d.ts.map