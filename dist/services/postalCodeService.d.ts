export declare class PostalCodeService {
    /**
     * Busca información de códigos postales
     * @param postalCode - Código postal parcial o completo
     * @returns Lista de códigos postales que coinciden
     */
    static searchByPostalCode(postalCode: string): Promise<{
        id: number;
        neighborhood: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        municipality: string;
    }[]>;
    /**
     * Obtiene información completa de un código postal específico
     * @param postalCode - Código postal exacto (5 dígitos)
     * @returns Información del código postal o null si no existe
     */
    static getByPostalCode(postalCode: string): Promise<{
        id: number;
        neighborhood: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        municipality: string;
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
}
//# sourceMappingURL=postalCodeService.d.ts.map