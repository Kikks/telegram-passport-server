import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';

import { SUCCESSFUL } from '../../lib/constants';
import ootpError from '../../lib/error';
import { failure, success } from '../../lib/response';
import PresidentService from '../services/president.svc';
import {
  validateCreatePresidentInputs,
  validateDeletePresidentsInputs,
  validateUpdatePresidentInputs,
} from '../validators/president.vld';

const handleGetPresident = async (req: Request, res: Response) => {
  try {
    const country = req.params.country;
    const president = await PresidentService.getPresident({ country });

    if (!president) throw new ootpError('President not found', 404);

    return success({
      res,
      data: president,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error: any) {
    return failure({
      res,
      message: error.message || 'An error occured while getting president.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetPresidents = async (req: Request, res: Response) => {
  try {
    const search = (req.query?.search || '') as string;
    const page = req.query?.page || 1;
    const limit = req.query?.limit || 10;
    const sortBy = (req.query?.sortBy || 'name') as string;
    const orderBy = (req.query.orderBy || 'asc') as SortOrder;
    const country = req.query?.country as string;

    const presidents = await PresidentService.getPresidents({
      search,
      query: {},
      page: Number(page),
      limit: Number(limit),
      sort: { [sortBy]: orderBy },
      country,
    });

    return success({
      res,
      data: presidents,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while getting presidents.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleCreatePresident = async (req: Request, res: Response) => {
  try {
    const { name, bio, duration, country, image } = validateCreatePresidentInputs(req, res);

    const president = await PresidentService.createPresident({
      name,
      bio,
      duration,
      image,
      country,
    });

    return success({
      res,
      data: president,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while creating president.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleUpdatePresident = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const value = validateUpdatePresidentInputs(req, res);

    const updatedPresident = await PresidentService.updatePresident({
      query: { _id: id },
      presidentDetails: value,
    });

    return success({
      res,
      data: updatedPresident,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while updating president.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleDeletePresidents = async (req: Request, res: Response) => {
  try {
    const { ids } = validateDeletePresidentsInputs(req, res);

    await PresidentService.deletePresidents(ids);

    return success({
      res,
      data: 'President(s) deleted successfully.',
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while deleting presidents.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

export {
  handleGetPresident,
  handleGetPresidents,
  handleUpdatePresident,
  handleCreatePresident,
  handleDeletePresidents,
};
