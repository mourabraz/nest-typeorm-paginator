export interface PaginationResponse<Entity> {
  items: Entity[];
  meta: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
  links: {
    first: string;
    previous: string | null;
    next: string | null;
    last: string;
  };
}
