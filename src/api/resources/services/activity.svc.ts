import moment from 'moment';
import { ObjectId } from 'mongodb';

import openai from '../../../clients/openai';
import Activity from '../../../db/models/Activity.model';
import { generateActivitiesPrompt } from '../../../utils/promptsGenerators';
import { CategoryEmoji, categoryEmojis, defaultCategories } from '../../lib/constants';
import ootpError from '../../lib/error';
import { generateMeta } from '../../lib/pagination';
import { IActivity, OActivity } from '../interfaces/activity.intf';
import { OCategory } from '../interfaces/category.intf';
import { OPost } from '../interfaces/post.intf';
import { sanitizeText } from '../utils/misc';
import { isEmpty } from '../utils/validation';
import CategoryService from './category.svc';
import PostService from './post.svc';

const getActivities = async ({
  limit = 10,
  page = 1,
  query = {},
  search,
  sort = { date: -1 },
  startDate,
  endDate,
  category,
  isPublished,
  country,
}: {
  query?: any;
  page?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: Record<string, 1 | -1>;
  category?: string;
  isPublished?: string;
  country?: string;
}) => {
  const revampedSearchQuery = {
    ...(search && !isEmpty(search)
      ? {
          title: { $regex: `.*${search}*.`, $options: 'i' },
        }
      : {}),
    ...(startDate || endDate
      ? {
          date: {
            ...(startDate && !isEmpty(startDate) ? { $gte: moment(startDate).toDate() } : {}),
            ...(endDate && !isEmpty(endDate) ? { $lte: moment(endDate).toDate() } : {}),
          },
        }
      : {}),
    ...(category && !isEmpty(category) ? { categories: new ObjectId(category) } : {}),
    ...(isPublished && !isEmpty(isPublished) ? { isPublished: Boolean(isPublished) } : {}),
    ...(country && !isEmpty(country) ? { country } : {}),
    ...query,
    isDeleted: false,
  };

  const count = await Activity.count(revampedSearchQuery);
  const activities = await Activity.aggregate([
    {
      $match: revampedSearchQuery,
    },
    {
      $lookup: {
        from: 'posts',
        localField: 'post',
        foreignField: '_id',
        as: 'post',
        pipeline: [
          {
            $project: {
              _id: 1,
              src: 1,
              url: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$post',
    },
    {
      $lookup: {
        from: 'sources',
        let: { srcId: '$post.src' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$srcId'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              image: 1,
            },
          },
        ],
        as: 'source',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categories',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $lookup: {
        from: 'votes',
        let: { activityId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$activity', '$$activityId'] },
                  { $in: ['$type', ['upvote', 'downvote']] },
                ],
              },
            },
          },
        ],
        as: 'votes',
      },
    },
    { $sort: sort },
    { $skip: (page - 1) * limit },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        title: 1,
        summary: 1,
        categories: 1,
        date: 1,
        isPublished: 1,
        country: 1,
        url: '$post.url',
        src: { $arrayElemAt: ['$source', 0] },
        upvotes: {
          $size: {
            $filter: {
              input: '$votes',
              as: 'vote',
              cond: { $eq: ['$$vote.type', 'upvote'] },
            },
          },
        },
        downvotes: {
          $size: {
            $filter: {
              input: '$votes',
              as: 'vote',
              cond: { $eq: ['$$vote.type', 'downvote'] },
            },
          },
        },
      },
    },
  ]);

  return { activities, meta: generateMeta(page, count, limit) };
};

const getActivity = async (query: any) => {
  const activities = await Activity.aggregate([
    {
      $match: { ...query, isDeleted: false },
    },
    {
      $lookup: {
        from: 'posts',
        localField: 'post',
        foreignField: '_id',
        as: 'post',
        pipeline: [
          {
            $project: {
              _id: 1,
              src: 1,
              url: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: '$post',
    },
    {
      $lookup: {
        from: 'sources',
        let: { srcId: '$post.src' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$srcId'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              image: 1,
            },
          },
        ],
        as: 'source',
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'categories',
        foreignField: '_id',
        as: 'categories',
      },
    },
    {
      $lookup: {
        from: 'votes',
        let: { activityId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$activity', '$$activityId'] },
                  { $in: ['$type', ['upvote', 'downvote']] },
                ],
              },
            },
          },
        ],
        as: 'votes',
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        summary: 1,
        categories: 1,
        date: 1,
        isPublished: 1,
        country: 1,
        url: '$post.url',
        src: { $arrayElemAt: ['$source', 0] },
        upvotes: {
          $size: {
            $filter: {
              input: '$votes',
              as: 'vote',
              cond: { $eq: ['$$vote.type', 'upvote'] },
            },
          },
        },
        downvotes: {
          $size: {
            $filter: {
              input: '$votes',
              as: 'vote',
              cond: { $eq: ['$$vote.type', 'downvote'] },
            },
          },
        },
      },
    },
  ]);

  return activities?.[0];
};

const createActivity = async (activityDetails: IActivity) => {
  const activity = await Activity.create(activityDetails);
  activity.save();
  return activity;
};

const createMultipleActivities = async (activityDetails: IActivity[]) => {
  const activities = await Activity.insertMany(activityDetails);
  return activities;
};

const updateActivity = async ({
  query,
  activityDetails,
}: {
  query: any;
  activityDetails: Partial<OActivity>;
}) => {
  const activity = await Activity.findOne({ ...query, isDeleted: false });
  if (!activity) throw new ootpError('No activity with that id exists.', 404);

  activity.set(activityDetails);

  await activity.save();

  return activity;
};

const deleteActivities = async (ids: ObjectId[]) => {
  const activities = await Activity.updateMany({ _id: { $in: ids } }, { isDeleted: true });
  return activities;
};

const countActivities = async (query: any) => {
  const activities = await Activity.count({ ...query, isDeleted: false });
  return activities;
};

const generateActivities = async (posts: OPost[]) => {
  const promises = posts.map(async (post) => {
    const prompt = generateActivitiesPrompt({
      title: post.title || '',
      content: post.content || '',
      categories: defaultCategories,
    });

    return openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 1000,
    });
  });
  const responses = await Promise.all(promises);
  const activities = responses.map((response) => response?.data?.choices[0]?.message?.content);

  const findCategoriesResult = await CategoryService.getCategories({
    limit: 100,
  });
  const categories: OCategory[] = findCategoriesResult.categories;
  const activityDetails: IActivity[] = [];

  for (let i = 0; i < activities.length; i++) {
    if (activities[i]) {
      const splitResult = activities[i]?.split('|');
      const summaryString = splitResult?.[1];
      const summary = sanitizeText(summaryString?.split('Summary: ')?.[1] || '');
      const categoriesString = splitResult?.[2];
      const generatedCategories = categoriesString?.split('Categories: ')?.[1]?.split(', ') || [];
      const categoryIds: ObjectId[] = [];

      for (let j = 0; j < generatedCategories.length; j++) {
        const generatedCategory = generatedCategories[j]?.trim();
        let category: OCategory;

        const existingCategory = categories.find(
          (category) => category?.name === generatedCategory
        );

        if (existingCategory) {
          category = existingCategory;
        } else {
          category = await CategoryService.createCategory({
            name: generatedCategory,
            emoji: categoryEmojis?.[generatedCategory as CategoryEmoji] || '',
          });
          categories.push(category);
        }

        categoryIds.push(category._id);
      }

      activityDetails.push({
        title: posts?.[i]?.title || '',
        summary,
        post: posts[i]._id,
        categories: categoryIds,
        date: posts[i].publishedAt,
        country: posts[i].country,
      });
    }
  }

  await PostService.updatePosts({
    query: { _id: { $in: posts.map((post) => post._id) } },
    postDetails: { isProcessed: true },
  });
  const generatedActivities = await ActivityService.createMultipleActivities(activityDetails);
  return generatedActivities;
};

const ActivityService = {
  getActivities,
  getActivity,
  createActivity,
  createMultipleActivities,
  updateActivity,
  deleteActivities,
  countActivities,
  generateActivities,
};
export default ActivityService;
