// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('../../../config.pagination');
export const defautValues = {
  page: 1,
  limit: 5,
  maxLimit: 200,
  ...config,
};
