import { createConnection } from 'typeorm';
import {
  CommentRepository,
  PostRepository,
  UserRepository,
} from './models/all.repository';
import { Comment } from './models/comment.entity';
import { Post } from './models/post.entity';
import { PostsService } from './models/posts.service';
import { User } from './models/user.entity';
import { defautValues } from '../config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const data = require('./big-data.json');

describe('Paginator', () => {
  let userRepository: UserRepository;
  let postRepository: PostRepository;
  let commentRepository: CommentRepository;
  let users: User[];
  let posts: Post[];
  let comments: Comment[];

  beforeAll(async () => {
    const connection = await createConnection({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      logging: false,
      entities: [User, Post, Comment],
    });

    userRepository = connection.getCustomRepository(UserRepository);
    postRepository = connection.getCustomRepository(PostRepository);
    commentRepository = connection.getCustomRepository(CommentRepository);

    const { users: usersData, posts: postsData, comments: commentsData } = data;
    users = await userRepository.save(
      usersData.map((i) => userRepository.create(i)),
    );
    posts = await postRepository.save(
      postsData.map((i) => postRepository.create(i)),
    );
    comments = await commentRepository.save(
      commentsData.map((i) => commentRepository.create(i)),
    );
  });

  it('should return a pagination result', async () => {
    const postService = new PostsService(postRepository);

    const paginate = {
      page: 1,
      limit: 5,
      sort: undefined,
      filter: undefined,
      path: '',
    };

    const { items, meta, links } = await postService.getAll(paginate);

    expect(items.length).toBe(paginate.limit);
    expect(meta.page).toBe(paginate.page);
    expect(meta.totalPages).toBe(Math.ceil(posts.length / paginate.limit));
    expect(meta.totalItems).toBe(posts.length);
    expect(links).toMatchObject({
      first: `?page=${paginate.page}&limit=${paginate.limit}`,
      previous: '',
      next: '',
      last: `?page=${Math.ceil(posts.length / paginate.limit)}&limit=${
        paginate.limit
      }`,
    });
  });

  it('should return a pagination with maximo limit if a bigger limit is given', async () => {
    const postService = new PostsService(postRepository);

    const paginate = {
      page: 1,
      limit: 500,
      sort: undefined,
      filter: undefined,
      path: '',
    };

    const { items, meta } = await postService.getAll(paginate);

    expect(items.length).toBe(defautValues.maxLimit);
    expect(meta.page).toBe(paginate.page);
    expect(meta.totalPages).toBe(
      Math.ceil(posts.length / defautValues.maxLimit),
    );
    expect(meta.totalItems).toBe(posts.length);
  });

  it('should return a pagination with page equal to 1 if a 0 or negative page is given', async () => {
    const postService1 = new PostsService(postRepository);
    const postService2 = new PostsService(postRepository);

    const paginate1 = {
      page: 0,
      limit: 10,
      sort: undefined,
      filter: undefined,
      path: '',
    };
    const paginate2 = {
      page: -1,
      limit: 10,
      sort: undefined,
      filter: undefined,
      path: '',
    };

    const { meta: meta1, links: links1 } = await postService1.getAll(paginate1);
    const { meta: meta2, links: links2 } = await postService2.getAll(paginate2);

    expect(meta1.page).toBe(1);
    expect(links1).toMatchObject({
      first: `?page=${1}&limit=${paginate1.limit}`,
      previous: '',
      next: '',
      last: `?page=${Math.ceil(posts.length / paginate1.limit)}&limit=${
        paginate1.limit
      }`,
    });
    expect(meta2.page).toBe(1);
    expect(links2).toMatchObject({
      first: `?page=${1}&limit=${paginate2.limit}`,
      previous: '',
      next: '',
      last: `?page=${Math.ceil(posts.length / paginate2.limit)}&limit=${
        paginate2.limit
      }`,
    });
  });

  it('should return the pagination sorted by the default if none is given', async () => {
    const postService = new PostsService(postRepository);

    const paginate = {
      page: 1,
      limit: 5,
      sort: undefined,
      filter: undefined,
      path: '',
    };

    const { items, links } = await postService.getAll(paginate);

    expect(items).toStrictEqual(posts.slice(paginate.page - 1, paginate.limit));
    expect(links).toMatchObject({
      first: `?page=${paginate.page}&limit=${paginate.limit}`,
      previous: '',
      next: '',
      last: `?page=${Math.ceil(posts.length / paginate.limit)}&limit=${
        paginate.limit
      }`,
    });
  });

  it('should return a pagination result with futher where clause', async () => {
    const user = users[0];
    const postService = new PostsService(postRepository);

    const paginate = {
      page: 1,
      limit: 5,
      sort: undefined,
      filter: undefined,
      path: '',
    };

    const postsForUser = posts.filter((i) => i.authorId === user.id);

    const { items } = await postService.getByUser(paginate, user);

    expect(items).toStrictEqual(
      postsForUser.slice(paginate.page - 1, paginate.limit),
    );
  });

  it('should return a pagination result with relationship', async () => {
    const postService = new PostsService(postRepository);

    const paginate = {
      page: 1,
      limit: 5,
      sort: undefined,
      filter: undefined,
      path: '',
    };

    const postsWitUsers = posts
      .slice(paginate.page - 1, paginate.limit)
      .map((p) => {
        const user = users.find((u) => u.id === p.authorId);
        return {
          ...p,
          user: { ...user },
        };
      });

    const { items } = await postService.getAllWithUsers(paginate);

    expect(items.map((i) => ({ ...i, user: { ...i.user } }))).toStrictEqual(
      postsWitUsers,
    );
  });

  it('should return a pagination result with correct links', async () => {
    const postService = new PostsService(postRepository);

    const paginate = {
      page: 1,
      limit: 5,
      sort: 'title:DESC',
      filter: undefined,
      path: '',
    };

    const { links } = await postService.getAll(paginate);

    expect(links).toMatchObject({
      first: `?page=${paginate.page}&limit=${paginate.limit}&sort=${paginate.sort}`,
      previous: '',
      next: '',
      last: `?page=${Math.ceil(posts.length / paginate.limit)}&limit=${
        paginate.limit
      }&sort=${paginate.sort}`,
    });
  });

  it('should return a pagination result items ordered correctly', async () => {
    const postService = new PostsService(postRepository);

    const paginate = {
      page: 1,
      limit: 5,
      sort: 'title:desc',
      filter: undefined,
      path: '',
    };

    const postsSorted = posts
      .sort((a, b) => {
        if (a.title > b.title) return -1;
        if (a.title < b.title) return 1;
        return 0;
      })
      .slice(paginate.page - 1, paginate.limit);

    const { items } = await postService.getAll(paginate);

    expect(items).toStrictEqual(postsSorted);
  });

  it('should return the pagination sorted by the default if an invalid is given', async () => {
    const postService = new PostsService(postRepository);

    const paginate = {
      page: 1,
      limit: 5,
      sort: 'teste:asc',
      filter: undefined,
      path: '',
    };

    const { items, links } = await postService.getAll(paginate);

    expect(items).toStrictEqual(
      posts
        .sort((a, b) => a.id - b.id)
        .slice(paginate.page - 1, paginate.limit),
    );
    expect(links).toMatchObject({
      first: `?page=${paginate.page}&limit=${paginate.limit}&sort=id:ASC`,
      previous: '',
      next: '',
      last: `?page=${Math.ceil(posts.length / paginate.limit)}&limit=${
        paginate.limit
      }&sort=id:ASC`,
    });
  });
});
