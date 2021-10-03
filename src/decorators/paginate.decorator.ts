import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { IPaginate } from '../interfaces/paginate.interface';

export const Paginate = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IPaginate => {
    const request: Request = ctx.switchToHttp().getRequest();

    const { protocol, baseUrl, path: requestPath, query } = request;
    const { page, limit, sort, filter } = query;

    const path = `${protocol}://${request.get('host')}${baseUrl}${requestPath}`;

    return {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sort: typeof sort === 'string' ? sort : undefined,
      filter: typeof filter === 'string' ? filter : undefined,
      path,
    };
  },
);
