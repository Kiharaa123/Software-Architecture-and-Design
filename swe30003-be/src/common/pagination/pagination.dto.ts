export class PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;

  constructor({
    page,
    limit,
    total,
  }: {
    page: number;
    limit: number;
    total: number;
  }) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasPrevPage = this.page > 1;
    this.hasNextPage = this.page < this.totalPages;
  }
}
