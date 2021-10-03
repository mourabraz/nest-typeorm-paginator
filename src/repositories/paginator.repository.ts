import {
  Any,
  Between,
  Equal,
  FindManyOptions,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Raw,
  Repository,
} from 'typeorm';
import { IPaginate } from '../interfaces/paginate.interface';
import { defautValues } from '../config';

export * from 'typeorm';

type TSort = { [key: string]: 'ASC' | 'DESC' };

const regexpMatchConditionals = /(.*)\('(.*)'\)/i;
const conditionals = {
  Not: Not,
  LessThan: LessThan,
  LessThanOrEqual: LessThanOrEqual,
  MoreThan: MoreThan,
  MoreThanOrEqual: MoreThanOrEqual,
  Equal: Equal,
  Like: Like,
  ILike: ILike,
  Between: Between,
  In: In,
  Any: Any,
  IsNull: IsNull,
  Raw: Raw,
};

const getSortableColumns = ({
  tableName,
  className,
}: {
  tableName: string;
  className: string;
}): string[] => {
  const {
    default: { sortableColumns },
  } = defautValues;

  if (
    defautValues[tableName] &&
    defautValues[tableName]['sortableColumns'] &&
    Array.isArray(defautValues[tableName]['sortableColumns'])
  ) {
    return defautValues[tableName]['sortableColumns'];
  }

  if (
    defautValues[className] &&
    defautValues[className]['sortableColumns'] &&
    Array.isArray(defautValues[className]['sortableColumns'])
  ) {
    return defautValues[className]['sortableColumns'];
  }

  if (Array.isArray(sortableColumns)) {
    return sortableColumns;
  }

  return [];
};
const sortFromString = (
  sort: string,
  targetNames: { tableName: string; className: string },
): TSort => {
  const parts = sort.split(',').map((i) => i.split(':'));

  let sortColumns = getSortableColumns(targetNames);
  const obj = parts.reduce((acc, [column, order]) => {
    if (sortColumns.includes(column)) {
      acc[column] = order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      sortColumns = sortColumns.filter((i) => i !== column);
    }

    return acc;
  }, {} as TSort);

  if (Object.keys(obj).length === 0) {
    obj.id = 'ASC';
  }

  return obj;
};
const sortToString = (sort): string => {
  return Object.entries(sort).reduce((acc, [k, v]) => {
    acc += `${k}:${v}`;
    return acc;
  }, '');
};

const getFilterableColumns = ({
  tableName,
  className,
}: {
  tableName: string;
  className: string;
}): string[] => {
  const {
    default: { filterableColumns },
  } = defautValues;

  if (
    defautValues[tableName] &&
    defautValues[tableName]['filterableColumns'] &&
    Array.isArray(defautValues[tableName]['filterableColumns'])
  ) {
    return defautValues[tableName]['filterableColumns'];
  }

  if (
    defautValues[className] &&
    defautValues[className]['filterableColumns'] &&
    Array.isArray(defautValues[className]['filterableColumns'])
  ) {
    return defautValues[className]['filterableColumns'];
  }

  if (Array.isArray(filterableColumns)) {
    return filterableColumns;
  }

  return [];
};
const filterValueFromString = (value: string) => {
  const match = value.match(regexpMatchConditionals);

  if (match) {
    const [, conditional, search] = match;
    const [firstConditional, secondConditional] = conditional.split('(');
    const firstConditionalFunction = conditionals[firstConditional];
    const secondConditionalFunction = conditionals[secondConditional];

    console.log(firstConditionalFunction, secondConditionalFunction);

    if (!firstConditionalFunction) return value;

    if (!secondConditionalFunction) return firstConditionalFunction(search);

    return firstConditionalFunction(secondConditionalFunction(search));
  }

  return Like(value);
};
const filterFromString = (
  filter: string,
  targetNames: { tableName: string; className: string },
) => {
  const filterColumns = getFilterableColumns(targetNames);

  let parsed = JSON.parse(filter);

  if (Array.isArray(parsed)) {
    console.log('isArray');
    return parsed.map((i) => filterFromString(i, targetNames));
  }

  if (Object.keys(parsed).length) {
    parsed = Object.entries(parsed)
      .filter(([k]) => filterColumns.includes(k))
      .reduce((acc, [k, v]) => {
        acc[k] = filterValueFromString(String(v));

        return acc;
      }, {});
  }

  return parsed;
};

export class PaginatorRepository<Entity> extends Repository<Entity> {
  async paginate(
    { page, limit, path, sort: sortFromPaginate, filter }: IPaginate,
    options?: FindManyOptions<Entity>,
  ): Promise<[Entity[], number, IPaginate]> {
    const sort = sortFromPaginate
      ? sortFromString(sortFromPaginate, {
          tableName: this.metadata.tableName,
          className: this.metadata.targetName,
        })
      : {};

    let whereFromFilter = filter
      ? filterFromString(filter, {
          tableName: this.metadata.tableName,
          className: this.metadata.targetName,
        })
      : {};

    if (!page || page <= 0) {
      page = defautValues.page;
    }

    if (!limit) {
      limit = defautValues.limit;
    }

    if (limit > defautValues.maxLimit) {
      limit = defautValues.maxLimit;
    }

    const whereFromOptions = options?.where;

    if (whereFromOptions) {
      if (Array.isArray(whereFromOptions)) {
        whereFromFilter = Array.isArray(whereFromFilter)
          ? [...whereFromFilter, ...whereFromOptions]
          : [whereFromFilter, ...whereFromOptions];
      } else if (typeof whereFromOptions === 'object') {
        whereFromFilter = Array.isArray(whereFromFilter)
          ? [...whereFromFilter, whereFromOptions]
          : { ...whereFromFilter, ...whereFromOptions };
      }
    }

    const query = {
      where: whereFromFilter,
      order: { ...sort },
      skip: (page - 1) * limit,
      take: limit,
      relations: options?.relations ?? [],
    };

    const result = await this.findAndCount({ ...query });

    return [
      ...result,
      {
        page,
        limit,
        path,
        sort: sortToString(sort),
        filter,
      },
    ];
  }
}
