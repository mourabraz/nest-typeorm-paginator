// import { resolve } from 'path';

// const filename = 'config.pagination.js';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('../../../config.pagination'); // resolve('..', '..', filename));

export const defautValues = {
  page: 1,
  limit: 5,
  maxLimit: 200,
  ...config,
};
