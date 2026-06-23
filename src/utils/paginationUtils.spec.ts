import { describe, it, expect } from "vitest";
import { paginateArray } from "./paginationUtils";

describe("paginateArray", () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

  it("returns the first page with correct items", () => {
    const result = paginateArray(items, 1, 10);
    expect(result.items).toHaveLength(10);
    expect(result.items[0]).toEqual({ id: 1 });
    expect(result.items[9]).toEqual({ id: 10 });
  });

  it("returns correct pagination metadata", () => {
    const result = paginateArray(items, 1, 10);
    expect(result.pagination).toEqual({
      page: 1,
      itemsPerPage: 10,
      totalItems: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false,
    });
  });

  it("returns the last page with remaining items", () => {
    const result = paginateArray(items, 3, 10);
    expect(result.items).toHaveLength(5);
    expect(result.items[0]).toEqual({ id: 21 });
    expect(result.pagination.hasNextPage).toBe(false);
    expect(result.pagination.hasPreviousPage).toBe(true);
  });

  it("returns empty items for page beyond range", () => {
    const result = paginateArray(items, 10, 10);
    expect(result.items).toHaveLength(0);
    expect(result.pagination.hasNextPage).toBe(false);
  });

  it("handles empty array", () => {
    const result = paginateArray([], 1, 10);
    expect(result.items).toHaveLength(0);
    expect(result.pagination.totalItems).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it("handles single item per page", () => {
    const result = paginateArray(items, 2, 1);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual({ id: 2 });
    expect(result.pagination.totalPages).toBe(25);
  });
});
