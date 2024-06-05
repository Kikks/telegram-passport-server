import { Request, Response } from 'express';
import { SortOrder } from 'mongoose';

import { SUCCESSFUL } from '../../lib/constants';
import ootpError from '../../lib/error';
import { failure, success } from '../../lib/response';
import { Auth0User } from '../interfaces/user.intf';
import UserService from '../services/user.svc';

const handleGetAdmin = async (req: Request, res: Response) => {
  try {
    const userObject: any = res.locals.user;
    const admin = await UserService.getUser({ _id: userObject?.id });

    if (!admin) throw new ootpError('User not found', 404);

    return success({
      res,
      data: admin,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error: any) {
    console.error(error);
    return failure({
      res,
      message: error.message || 'An error occured while getting user.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetUser = async (req: Request, res: Response) => {
  try {
    const userObject: Auth0User = res.locals.user;
    const user = await UserService.getUser({ email: userObject?.email });

    if (!user) throw new ootpError('User not found', 404);

    return success({
      res,
      data: user,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error: any) {
    console.error(error);
    return failure({
      res,
      message: error.message || 'An error occured while getting user.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetUsers = async (req: Request, res: Response) => {
  try {
    const search = (req.query?.search || '') as string;
    const role = req.query?.role as string;
    const page = req.query?.page || 1;
    const limit = req.query?.limit || 10;
    const sortBy = (req.query?.sortBy || 'name') as string;
    const orderBy = (req.query.orderBy || 'desc') as SortOrder;
    const country = req.query?.country as string;

    const users = await UserService.getUsers({
      search,
      query: {},
      page: Number(page),
      limit: Number(limit),
      sort: { [sortBy]: orderBy },
      role,
      country,
    });

    return success({
      res,
      data: users,
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

export { handleGetAdmin, handleGetUser, handleGetUsers };
