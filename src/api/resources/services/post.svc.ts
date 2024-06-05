import moment from 'moment';
import { ObjectId } from 'mongodb';

import Post from '../../../db/models/Post.model';
import ootpError from '../../lib/error';
import { generateMeta } from '../../lib/pagination';
import { IPost, OPost } from '../interfaces/post.intf';
import { isEmpty } from '../utils/validation';

const getPosts = async ({
  limit = 10,
  page = 1,
  query = {},
  search,
  sort = { publisedAt: 'desc' },
  status,
  src,
  startDate,
  endDate,
  country,
}: {
  query?: any;
  page?: number;
  limit?: number;
  search?: string;
  sort?: Record<any, any>;
  status?: string;
  src?: string | ObjectId;
  startDate?: string;
  endDate?: string;
  country?: string;
}) => {
  const revampedSearchQuery = {
    ...(search
      ? {
          title: { $regex: isEmpty(search) ? '' : `.*${search}*.`, $options: 'i' },
        }
      : {}),
    ...(startDate || endDate
      ? {
          publishedAt: {
            ...(startDate && !isEmpty(startDate) ? { $gte: moment(startDate).toDate() } : {}),
            ...(endDate && !isEmpty(endDate) ? { $lte: moment(endDate).toDate() } : {}),
          },
        }
      : {}),
    ...(country ? { country } : {}),
    ...(status ? { status } : {}),
    ...(src ? { src: new ObjectId(src) } : {}),
    ...query,
    isDeleted: false,
  };

  const count = await Post.count(revampedSearchQuery);
  const posts = await Post.find(revampedSearchQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sort)
    .populate({
      path: 'src',
      select: 'name image',
    });

  return { posts, meta: generateMeta(page, count, limit) };
};

const getPost = async (query: any) => {
  const post = await Post.findOne({ ...query, isDeleted: false }).populate({
    path: 'src',
    select: 'name image',
  });
  return post;
};

const createPost = async (postDetails: IPost) => {
  const post = await Post.create(postDetails);
  post.save();
  return post;
};

const createMultiplePosts = async (postDetails: IPost[]) => {
  const posts = await Post.insertMany(postDetails);
  return posts;
};

const updatePost = async ({ query, postDetails }: { query: any; postDetails: Partial<OPost> }) => {
  const post = await getPost({ ...query, isDeleted: false });
  if (!post) throw new ootpError('No post with that id exists.', 404);

  post.status = postDetails.status || post.status;

  await post.save();

  return post;
};

const updatePosts = async ({ query, postDetails }: { query: any; postDetails: Partial<OPost> }) => {
  const posts = await Post.updateMany({ ...query, isDeleted: false }, postDetails, { new: true });
  return posts;
};

const deletePosts = async (ids: (string | ObjectId)[]) => {
  const posts = await Post.updateMany({ _id: { $in: ids } }, { isDeleted: true });
  return posts;
};

const countPosts = async (query: any) => {
  const posts = await Post.count({ ...query, isDeleted: false });
  return posts;
};

const PostService = {
  getPosts,
  getPost,
  createPost,
  createMultiplePosts,
  updatePost,
  updatePosts,
  deletePosts,
  countPosts,
};
export default PostService;
