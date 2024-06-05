import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

import { SUCCESSFUL } from '../../lib/constants';
import ootpError from '../../lib/error';
import { failure, success } from '../../lib/response';
import ActivityService from '../services/activity.svc';
import PostService from '../services/post.svc';
import {
  validateDeleteActivitiesInputs,
  validateUpdateActivityInputs,
} from '../validators/activity.vld';

const handleGetActivity = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const activity = await ActivityService.getActivity({ _id: new ObjectId(id) });

    if (!activity) throw new ootpError('Activity not found', 404);

    return success({
      res,
      data: activity,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error: any) {
    return failure({
      res,
      message: error.message || 'An error occured while getting activity.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetActivities = async (req: Request, res: Response) => {
  try {
    const search = (req.query?.search || '') as string;
    const page = req.query?.page || 1;
    const limit = req.query?.limit || 10;
    const sortBy = (req.query?.sortBy || 'date') as string;
    const startDate = req.query?.startDate as string;
    const endDate = req.query?.endDate as string;
    const category = req.query?.category as string;
    const isPublished = req.query?.isPublished as string;
    const country = req.query?.country as string;

    const activities = await ActivityService.getActivities({
      search,
      query: {},
      page: Number(page),
      limit: Number(limit),
      sort: { [sortBy]: -1 },
      category,
      startDate,
      endDate,
      isPublished,
      country,
    });

    return success({
      res,
      data: activities,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while getting activities.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGenerateActivities = async (req: Request, res: Response) => {
  try {
    const unprocessPosts = await PostService.getPosts({
      query: { isProcessed: false, status: 'approved' },
      limit: 100,
    });

    const generatedActivities = await ActivityService.generateActivities(unprocessPosts.posts);

    return success({
      res,
      data: generatedActivities,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while generating activities.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleUpdateActivity = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const value = validateUpdateActivityInputs(req, res);

    const updatedActivity = await ActivityService.updateActivity({
      query: { _id: id },
      activityDetails: value,
    });

    return success({
      res,
      data: updatedActivity,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while updateing activity.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleDeleteActivities = async (req: Request, res: Response) => {
  try {
    const { ids } = validateDeleteActivitiesInputs(req, res);

    await ActivityService.deleteActivities(ids);

    return success({
      res,
      data: 'Activities deleted successfully.',
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while deleting activities.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

export {
  handleGetActivity,
  handleGetActivities,
  handleGenerateActivities,
  handleUpdateActivity,
  handleDeleteActivities,
};
