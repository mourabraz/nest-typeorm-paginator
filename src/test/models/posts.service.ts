import { PaginationResponse, PaginatorService, IPaginate } from '../..';

import { Post } from './post.entity';
import { PostRepository } from './all.repository';
import { User } from './user.entity';

export class PostsService extends PaginatorService<Post> {
  constructor(private postRepository: PostRepository) {
    super(postRepository);
  }

  async getAll(pagination: IPaginate): Promise<PaginationResponse<Post>> {
    return await super.getAll(pagination);
  }

  async getByUser(
    pagination: IPaginate,
    user: User,
  ): Promise<PaginationResponse<Post>> {
    return await super.getAll(pagination, { where: { authorId: user.id } });
    // return await super.getAll(pagination, { where: {user}, relations: ['user']});
  }

  async getAllWithUsers(
    pagination: IPaginate,
  ): Promise<PaginationResponse<Post>> {
    return await super.getAll(pagination, { relations: ['user'] });
  }
}
