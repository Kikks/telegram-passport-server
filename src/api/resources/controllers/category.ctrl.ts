import { Request, Response } from 'express';

import { SUCCESSFUL } from '../../lib/constants';
import ootpError from '../../lib/error';
import { failure, success } from '../../lib/response';
import CategoryService from '../services/category.svc';

const handleGetCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const category = await CategoryService.getCategory({ _id: id });

    if (!category) throw new ootpError('Category not found', 404);

    return success({
      res,
      data: category,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error: any) {
    return failure({
      res,
      message: error.message || 'An error occured while getting category.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetCategories = async (req: Request, res: Response) => {
  try {
    const search = (req.query?.search || '') as string;
    const page = req.query?.page || 1;
    const limit = req.query?.limit || 100;
    const sortBy = (req.query?.sortBy || 'name') as string;

    const categories = await CategoryService.getCategories({
      search,
      query: {},
      page: Number(page),
      limit: Number(limit),
      sort: { [sortBy]: 'asc' },
    });

    return success({
      res,
      data: categories,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while getting categories.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

export { handleGetCategory, handleGetCategories };
