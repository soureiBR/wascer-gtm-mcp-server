export function paginateArray<T>(
  items: T[],
  page: number,
  itemsPerPage: number,
) {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    items: paginatedItems,
    pagination: {
      page,
      itemsPerPage,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
