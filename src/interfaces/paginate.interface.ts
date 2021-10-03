export interface IPaginate {
  page?: number;
  limit?: number;
  sort?: string;
  filter?: string;
  path: string;
}
