"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stateController = void 0;
const stateService_1 = require("../services/stateService");
exports.stateController = {
    /**
     * Obtiene todos los estados
     * GET /api/states
     */
    async getAllStates(req, res) {
        try {
            const states = await stateService_1.StateService.getAllStates();
            return res.json({
                success: true,
                data: states
            });
        }
        catch (error) {
            console.error('Error getting states:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener los estados'
            });
        }
    },
    /**
     * Obtiene un estado por su código
     * GET /api/states/:code
     */
    async getStateByCode(req, res) {
        try {
            const { code } = req.params;
            if (!code) {
                return res.status(400).json({
                    success: false,
                    message: 'El código del estado es requerido'
                });
            }
            const state = await stateService_1.StateService.getStateByCode(code);
            if (!state) {
                return res.status(404).json({
                    success: false,
                    message: 'Estado no encontrado'
                });
            }
            return res.json({
                success: true,
                data: state
            });
        }
        catch (error) {
            console.error('Error getting state:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener el estado'
            });
        }
    }
};
//# sourceMappingURL=stateController.js.map