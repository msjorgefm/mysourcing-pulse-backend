"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestController = void 0;
const invitationService_1 = require("../services/invitationService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TestController {
    // Endpoint de prueba para generar invitación
    static async testInvitation(req, res) {
        try {
            // Solo en desarrollo
            if (process.env.NODE_ENV !== 'development') {
                return res.status(403).json({
                    success: false,
                    error: 'This endpoint is only available in development'
                });
            }
            const { companyId } = req.body;
            let company;
            if (companyId) {
                // Usar empresa específica
                company = await prisma.company.findUnique({
                    where: { id: companyId }
                });
            }
            else {
                // Buscar primera empresa en setup
                company = await prisma.company.findFirst({
                    where: { status: 'IN_SETUP' },
                    orderBy: { createdAt: 'desc' }
                });
            }
            if (!company) {
                return res.status(404).json({
                    success: false,
                    error: 'No company found. Create a company first from the operator portal.'
                });
            }
            // Generar invitación
            await invitationService_1.InvitationService.createAndSendInvitation(company.id, company.email, company.name);
            // Obtener el token más reciente
            const invitation = await prisma.invitationToken.findFirst({
                where: {
                    companyId: company.id,
                    used: false
                },
                orderBy: { createdAt: 'desc' }
            });
            const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/setup-account?token=${invitation?.token}`;
            res.json({
                success: true,
                message: 'Invitation generated successfully',
                data: {
                    company: {
                        id: company.id,
                        name: company.name,
                        email: company.email
                    },
                    invitationLink,
                    expiresAt: invitation?.expiresAt,
                    note: 'Check server logs for the invitation link in development mode'
                }
            });
        }
        catch (error) {
            console.error('Error in test invitation:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to generate test invitation'
            });
        }
    }
}
exports.TestController = TestController;
//# sourceMappingURL=testController.js.map