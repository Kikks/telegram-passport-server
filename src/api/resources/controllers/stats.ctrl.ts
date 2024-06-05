import { Request, Response } from 'express';

import { failure, success } from '../../../api/lib/response';
import ActivityService from '../services/activity.svc';
import CategoryService from '../services/category.svc';
import PostService from '../services/post.svc';
import SourceService from '../services/source.svc';
import UserService from '../services/user.svc';
import VoteService from '../services/vote.svc';
import { isEmpty } from '../utils/validation';

const handleGetActivityStats = async (req: Request, res: Response) => {
  try {
    const country = req.query?.country as string;

    const total = await ActivityService.countActivities({
      ...(country && !isEmpty(country) ? { country } : {}),
    });
    const published = await ActivityService.countActivities({
      ...(country && !isEmpty(country) ? { country } : {}),
      isPublished: true,
    });
    const unpublished = await ActivityService.countActivities({
      ...(country && !isEmpty(country) ? { country } : {}),
      isPublished: false,
    });

    return success({
      res,
      message: 'Successfully retrieved activity stats.',
      data: {
        total,
        published,
        unpublished,
      },
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while getting activity stats.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetPostStats = async (req: Request, res: Response) => {
  try {
    const country = req.query?.country as string;

    const total = await PostService.countPosts({
      ...(country && !isEmpty(country) ? { country } : {}),
    });
    const approved = await PostService.countPosts({
      ...(country && !isEmpty(country) ? { country } : {}),
      status: 'approved',
    });
    const pending = await PostService.countPosts({
      ...(country && !isEmpty(country) ? { country } : {}),
      status: 'pending',
    });

    return success({
      res,
      message: 'Successfully retrieved post stats.',
      data: {
        total,
        approved,
        pending,
      },
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while getting post stats.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetCategoryStats = async (req: Request, res: Response) => {
  try {
    const total = await CategoryService.countCategories({});

    return success({
      res,
      message: 'Successfully retrieved category stats.',
      data: {
        total,
      },
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while getting category stats.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetUserStats = async (req: Request, res: Response) => {
  try {
    const country = req.query?.country as string;

    const total = await UserService.countUsers({
      ...(country && !isEmpty(country) ? { country } : {}),
      role: 'user',
    });

    return success({
      res,
      message: 'Successfully retrieved user stats.',
      data: {
        total,
      },
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while getting user stats.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetVoteStats = async (req: Request, res: Response) => {
  try {
    const country = req.query?.country as string;

    const total = await VoteService.countVotes({
      ...(country && !isEmpty(country) ? { country } : {}),
    });
    const upvotes = await VoteService.countVotes({
      ...(country && !isEmpty(country) ? { country } : {}),
      type: 'upvote',
    });
    const downvotes = await VoteService.countVotes({
      ...(country && !isEmpty(country) ? { country } : {}),
      type: 'downvote',
    });

    return success({
      res,
      message: 'Successfully retrieved vote stats.',
      data: {
        total,
        upvotes,
        downvotes,
      },
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while getting vote stats.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetSourceStats = async (req: Request, res: Response) => {
  try {
    const country = req.query?.country as string;

    const total = await SourceService.countSources({
      ...(country && !isEmpty(country) ? { country } : {}),
    });

    return success({
      res,
      message: 'Successfully retrieved sources stats.',
      data: {
        total,
      },
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while getting sources stats.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

export {
  handleGetActivityStats,
  handleGetPostStats,
  handleGetCategoryStats,
  handleGetUserStats,
  handleGetVoteStats,
  handleGetSourceStats,
};
