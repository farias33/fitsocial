export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
  };
}

export function paginate(params: PaginationParams): { skip: number; take: number } {
  const page = Math.max(1, params.page);
  const limit = Math.min(100, Math.max(1, params.limit));
  return { skip: (page - 1) * limit, take: limit };
}
