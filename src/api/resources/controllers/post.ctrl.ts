import { Request, Response } from 'express';
import moment from 'moment';
import { SortOrder } from 'mongoose';

import { SUCCESSFUL } from '../../lib/constants';
import ootpError from '../../lib/error';
import { failure, success } from '../../lib/response';
import PostService from '../services/post.svc';
import {
  validateCreatePostInputs,
  validateDeletePostsInputs,
  validateUpdatePostInputs,
} from '../validators/post.vld';

const handleGetPost = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const post = await PostService.getPost({ _id: id });

    if (!post) throw new ootpError('Post not found', 404);

    return success({
      res,
      data: post,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error: any) {
    return failure({
      res,
      message: error.message || 'An error occured while getting post.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetPosts = async (req: Request, res: Response) => {
  try {
    const search = (req.query?.search || '') as string;
    const status = req.query?.status as string;
    const page = req.query?.page || 1;
    const limit = req.query?.limit || 10;
    const sortBy = (req.query?.sortBy || 'createdAt') as string;
    const orderBy = (req.query.orderBy || 'desc') as SortOrder;
    const src = req.query?.src as string;
    const endDate = req.query?.endDate as string;
    const startDate = req.query?.startDate as string;
    const country = req.query?.country as string;

    const posts = await PostService.getPosts({
      search,
      query: {},
      page: Number(page),
      limit: Number(limit),
      sort: { [sortBy]: orderBy },
      src,
      status,
      startDate,
      endDate,
      country,
    });

    return success({
      res,
      data: posts,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while getting posts.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleCreatePost = async (req: Request, res: Response) => {
  try {
    const { title, content, publishedAt, src, url, country } = validateCreatePostInputs(req, res);

    const post = await PostService.createPost({
      title,
      content,
      publishedAt: moment(publishedAt).toDate(),
      src,
      url,
      country,
    });

    return success({
      res,
      data: post,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while creating post.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleUpdatePostStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const value = validateUpdatePostInputs(req, res);

    const updatedPost = await PostService.updatePost({
      query: { _id: id },
      postDetails: value,
    });

    return success({
      res,
      data: updatedPost,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while updating post.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleDeletePost = async (req: Request, res: Response) => {
  try {
    const { ids } = validateDeletePostsInputs(req, res);

    await PostService.deletePosts(ids);

    return success({
      res,
      data: 'Post(s) deleted successfully.',
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while deleting posts.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

export {
  handleGetPost,
  handleGetPosts,
  handleUpdatePostStatus,
  handleCreatePost,
  handleDeletePost,
};
