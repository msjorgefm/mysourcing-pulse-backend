import prisma from '../config/database';

export const locationService = {
  // Get all states
  async getStates() {
    return await prisma.state.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    });
  },

  // Get municipios by state
  async getMunicipiosByState(stateCode: string) {
    return await prisma.municipio.findMany({
      where: {
        stateCode,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });
  },

  // Get ciudades by municipio
  async getCiudadesByMunicipio(municipioCode: string) {
    return await prisma.ciudad.findMany({
      where: {
        municipioCode,
        isActive: true
      },
      select: {
        name: true
      },
      distinct: ['name'],
      orderBy: { name: 'asc' }
    });
  },

  // Get colonias by ciudad and municipio
  async getColoniasByMunicipioAndCiudad(municipioCode: string, cityName: string) {
    return await prisma.colonia.findMany({
      where: {
        municipioCode,
        cityName,
        isActive: true
      },
      orderBy: { name: 'asc' }
    });
  },

  // Get location data by postal code
  async getLocationByPostalCode(postalCode: string) {
    const colonias = await prisma.colonia.findMany({
      where: {
        postalCode,
        isActive: true
      },
      include: {
        state: true,
        municipio: true
      }
    });

    if (colonias.length === 0) {
      return null;
    }

    // Group unique values
    const uniqueCities = [...new Set(colonias.map((c: any) => c.cityName))];
    const uniqueColonias = [...new Set(colonias.map((c: any) => c.name))];

    return {
      state: colonias[0].state,
      municipio: colonias[0].municipio,
      cities: uniqueCities,
      colonias: uniqueColonias,
      stateCode: colonias[0].stateCode,
      municipioCode: colonias[0].municipioCode
    };
  }
};