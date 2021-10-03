<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

# NestJs Typeorm Paginator

## Description

A helper package to paginate,sort and filter your lists.

## Installation

```bash
$ npm install nest-typeorm-paginator
```

## Usage

- See an example in /test/models

## Add a config file in the root folder

```js
// config.pagination.ts
module.exports = {
  default: {
    sortableColumns: ['id'],
    filterableColumns: ['id'],
  },
  Post: {
    sortableColumns: ['id', 'title'],
    filterableColumns: ['id', 'title'],
  },
};
```

## Made by

- Author - [Moura Braz](mailto:mourabraz@hotmail.com)

## License

[MIT licensed](LICENSE).
