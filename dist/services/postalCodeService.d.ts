export declare class PostalCodeService {
    /**
     * Busca información de códigos postales
     * @param postalCode - Código postal parcial o completo
     * @returns Lista de códigos postales que coinciden
     */
    static searchByPostalCode(postalCode: string): Promise<{
        id: number;
        postalCode: string;
        neighborhood: string;
        city: string;
        state: string;
        municipality: string;
        country: string;
    }[]>;
    /**
     * Obtiene información completa de un código postal específico
     * @param postalCode - Código postal exacto (5 dígitos)
     * @returns Información del código postal o null si no existe
     */
    static getByPostalCode(postalCode: string): Promise<{
        id: number;
        postalCode: string;
        neighborhood: string;
        city: string;
        state: string;
        municipality: string;
        country: string;
    } | null>;
    /**
     * Obtiene todos los colonias/barrios para un código postal
     * @param postalCode - Código postal exacto (5 dígitos)
     * @returns Lista de colonias disponibles
     */
    static getNeighborhoodsByPostalCode(postalCode: string): Promise<{
        id: number;
        neighborhood: string;
    }[]>;
    /**
     * Crea un nuevo código postal si no existe
     * @param data - Datos del nuevo código postal
     * @returns El código postal creado o el existente
     */
    static createPostalCodeIfNotExists(data: {
        postalCode: string;
        neighborhood: string;
        city: string;
        state: string;
        municipality?: string;
    }): Promise<{
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        postalCode: string;
        neighborhood: string;
        city: string;
        state: string;
        municipality: string;
        country: string;
    }>;
}
//# sourceMappingURL=postalCodeService.d.ts.map