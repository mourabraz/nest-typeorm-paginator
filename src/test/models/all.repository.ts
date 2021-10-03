import {
  EntityRepository,
  PaginatorRepository,
} from '../../repositories/paginator.repository';
import { Comment } from './comment.entity';

import { Post } from './post.entity';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends PaginatorRepository<User> {}

@EntityRepository(Post)
export class PostRepository extends PaginatorRepository<Post> {}

@EntityRepository(Comment)
export class CommentRepository extends PaginatorRepository<Comment> {}
