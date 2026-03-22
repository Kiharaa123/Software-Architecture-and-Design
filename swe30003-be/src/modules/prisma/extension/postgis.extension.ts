import { Prisma, Location } from '@prisma/client';
import { PrismaProvider } from '../prisma.provider';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const postgisExtension = Prisma.defineExtension({
  name: 'postgis-extension',
  model: {
    location: {
      needs: {
        id: true,
      },
      async create<T>(
        this: T,
        params: {
          data: {
            name: string;
            coordinates: {
              latitude: number;
              longitude: number;
            };
          };
        },
      ): Promise<Location> {
        const { data } = params;
        const { name, coordinates } = data;
        const point = `POINT(${coordinates.longitude} ${coordinates.latitude})`;

        const context = Prisma.getExtensionContext(this);
        const provider = context.$parent as PrismaProvider;

        const result = await provider.$queryRaw<Location>`
          INSERT INTO "Location" (name, coordinates) VALUES (${name}, ST_GeomFromText(${point}, 4326));
        `;

        // Return the object
        return result;
      },
      async updateCoordinates<T>(
        this: T,
        params: {
          data: {
            coordinates: {
              latitude: number;
              longitude: number;
            };
          };
          id: string;
        },
      ): Promise<Location> {
        const { data, id } = params;
        const { coordinates } = data;

        // Update the coordinates
        const point = `POINT(${coordinates.longitude} ${coordinates.latitude})`;

        const context = Prisma.getExtensionContext(this);
        const provider = context.$parent as PrismaProvider;

        const result = await provider.$queryRaw<Location>`
          INSERT INTO "Location" (id, coordinates) VALUES (${id}, ST_GeomFromText(${point}, 4326)) ON CONFLICT (id) DO UPDATE SET coordinates = ST_GeomFromText(${point}, 4326);
        `;

        // Return the object
        return result;
      },
    },
  },
});
