// Define types based on GraphQL schema
export const CategoryType = {
  Boats: 'BOATS',
  Planes: 'PLANES',
  Bikes: 'BIKES',
  Cars: 'CARS'
} as const;

export type CategoryType = typeof CategoryType[keyof typeof CategoryType];

// Legacy enum mapping for existing code
export const CategoryTypeMap = {
  BOATS: CategoryType.Boats,
  PLANES: CategoryType.Planes,
  BIKES: CategoryType.Bikes,
  CARS: CategoryType.Cars
} as const;