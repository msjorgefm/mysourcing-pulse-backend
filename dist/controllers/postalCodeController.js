"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postalCodeController = void 0;
const postalCodeService_1 = require("../services/postalCodeService");
exports.postalCodeController = {
    /**
     * Busca códigos postales por coincidencia parcial
     * GET /api/postal-codes/search?q=68240
     */
    async search(req, res) {
        try {
            const { q } = req.query;
            if (!q || typeof q !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro de búsqueda es requerido'
                });
            }
            const postalCodes = await postalCodeService_1.PostalCodeService.searchByPostalCode(q);
            return res.json({
                success: true,
                data: postalCodes
            });
        }
        catch (error) {
            console.error('Error searching postal codes:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al buscar códigos postales'
            });
        }
    },
    /**
     * Obtiene información de un código postal específico
     * GET /api/postal-codes/:postalCode
     */
    async getByCode(req, res) {
        try {
            const { postalCode } = req.params;
            if (!postalCode || postalCode.length !== 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Código postal inválido. Debe tener 5 dígitos'
                });
            }
            const postalCodeData = await postalCodeService_1.PostalCodeService.getByPostalCode(postalCode);
            if (!postalCodeData) {
                return res.status(404).json({
                    success: false,
                    message: 'Código postal no encontrado'
                });
            }
            return res.json({
                success: true,
                data: postalCodeData
            });
        }
        catch (error) {
            console.error('Error getting postal code:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener información del código postal'
            });
        }
    },
    /**
     * Obtiene las colonias disponibles para un código postal
     * GET /api/postal-codes/:postalCode/neighborhoods
     */
    async getNeighborhoods(req, res) {
        try {
            const { postalCode } = req.params;
            if (!postalCode || postalCode.length !== 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Código postal inválido. Debe tener 5 dígitos'
                });
            }
            const neighborhoods = await postalCodeService_1.PostalCodeService.getNeighborhoodsByPostalCode(postalCode);
            return res.json({
                success: true,
                data: neighborhoods
            });
        }
        catch (error) {
            console.error('Error getting neighborhoods:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener las colonias'
            });
        }
    }
};
//# sourceMappingURL=postalCodeController.js.map