export const createInitialState = () => ({
  first: 0,
  rows: 10,
  page: 1,
  sortField: null,
  sortOrder: null,
  filters: null,
});

export const createFiltersPayload = (input) => {
  if (!input) return undefined;
  return Object.entries(input).reduce((acc, [key, value]) => {
    if (value.value) {
      return {
        ...acc,
        [key]:
          typeof value.value === 'string'
            ? value.value?.trim()?.toLowerCase()
            : value.value,
      };
    }
    return acc;
  }, {});
};

export const modeNameFormatter = (name) => {
  switch (name) {
    case 'MOT_AIR':
      return 'Air';

    case 'MOT_OCEAN':
    case 'OCEAN':
      return 'Ocean';

    case 'MOT_TRUCK':
      return 'Truck';
    default:
      return '';
  }
};

export const createTableStructure = (gridIds) =>
  gridIds.reduce(
    (prev, curr) => ({
      ...prev,
      [curr]: {
        pagination: {
          offset: 0,
          limit: 10,
        },
        sorting: {
          sortBy: null,
          sortOrder: null,
        },
        filtering: null,
      },
    }),
    {},
  );
