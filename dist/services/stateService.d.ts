export declare class StateService {
    /**
     * Obtiene todos los estados activos
     * @returns Lista de estados ordenados alfabéticamente
     */
    static getAllStates(): Promise<{
        id: number;
        name: string;
        code: string;
        abbreviation: string;
    }[]>;
    /**
     * Obtiene un estado por su código
     * @param code - Código del estado (ej: 'OAX', 'CMX')
     * @returns Información del estado o null si no existe
     */
    static getStateByCode(code: string): Promise<{
        id: number;
        name: string;
        code: string;
        abbreviation: string;
    } | null>;
}
//# sourceMappingURL=stateService.d.ts.map