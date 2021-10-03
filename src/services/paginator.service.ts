import { FindManyOptions } from 'typeorm';
import { IPaginate } from '../interfaces/paginate.interface';
import { PaginationResponse } from '../interfaces/reponse.interface';
import { PaginatorRepository } from '../repositories/paginator.repository';

class Pagination<Entity> {
  items: Entity[];
  totalItems: number;
  page: number;
  totalPages: number;
  path: string;
  limit: number;
  sort?: string;
  filter?: string;

  constructor(items: Entity[], total: number, pagination: IPaginate) {
    this.items = items;
    this.totalItems = total;

    const { page, limit, path, sort, filter } = pagination;
    this.sort = sort;
    this.filter = filter;
    this.path = path;
    this.page = page;
    this.limit = limit;

    this.totalPages = total > 0 ? Math.ceil(total / this.limit) : 0;
  }

  get(): PaginationResponse<Entity> {
    return {
      items: this.items,
      meta: {
        page: this.page,
        totalPages: this.totalPages,
        totalItems: this.totalItems,
      },
      links: {
        first: `${this.path}?page=1&limit=${this.limit}${
          this.sort ? '&sort=' + this.sort : ''
        }${this.filter ? '&filter=' + this.filter : ''}`,
        previous: '',
        next: '',
        last: `${this.path}?page=${this.totalPages}&limit=${this.limit}${
          this.sort ? '&sort=' + this.sort : ''
        }${this.filter ? '&filter=' + this.filter : ''}`,
      },
    };
  }
}

export class PaginatorService<Entity> {
  constructor(private paginatorRepository: PaginatorRepository<Entity>) {}

  async getAll(
    pagination: IPaginate,
    options?: FindManyOptions<Entity>,
  ): Promise<PaginationResponse<Entity>> {
    const [items, total, paginationInfo] =
      await this.paginatorRepository.paginate(pagination, options);

    return new Pagination<Entity>(items, total, paginationInfo).get();
  }
}
