import { ObjectId } from 'mongodb';

import President from '../../../db/models/President.model';
import ootpError from '../../lib/error';
import { generateMeta } from '../../lib/pagination';
import { IPresident, OPresident } from '../interfaces/president.intf';
import { isEmpty } from '../utils/validation';

const getPresidents = async ({
  limit = 10,
  page = 1,
  query = {},
  search,
  sort = { name: 'asc' },
  country,
}: {
  query?: any;
  page?: number;
  limit?: number;
  search?: string;
  sort?: Record<any, any>;
  country?: string;
}) => {
  const revampedSearchQuery = {
    ...(search
      ? {
          $or: [
            {
              name: { $regex: isEmpty(search) ? '' : `.*${search}*.`, $options: 'i' },
            },
            {
              country: { $regex: isEmpty(search) ? '' : `.*${search}*.`, $options: 'i' },
            },
          ],
        }
      : {}),
    ...(country ? { country } : {}),
    ...query,
  };

  const count = await President.count(revampedSearchQuery);
  const presidents = await President.find(revampedSearchQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sort);

  return { presidents, meta: generateMeta(page, count, limit) };
};

const getPresident = async (query: any) => {
  const president = await President.findOne({ ...query });
  return president;
};

const createPresident = async (presidentDetails: IPresident) => {
  const president = await President.create(presidentDetails);
  president.save();
  return president;
};

const createMultiplePresidents = async (presidentDetails: IPresident[]) => {
  const presidents = await President.insertMany(presidentDetails);
  return presidents;
};

const updatePresident = async ({
  query,
  presidentDetails,
}: {
  query: any;
  presidentDetails: Partial<OPresident>;
}) => {
  const president = await getPresident({ ...query });
  if (!president) throw new ootpError('No president with that id exists.', 404);

  president.name = presidentDetails.name || president.name;
  president.country = presidentDetails.country || president.country;
  president.bio = presidentDetails.bio || president.bio;
  president.duration = presidentDetails.duration || president.duration;

  await president.save();

  return president;
};

const updatePresidents = async ({
  query,
  presidentDetails,
}: {
  query: any;
  presidentDetails: Partial<OPresident>;
}) => {
  const presidents = await President.updateMany({ ...query }, presidentDetails, {
    new: true,
  });
  return presidents;
};

const deletePresidents = async (ids: (string | ObjectId)[]) => {
  const presidents = await President.updateMany({ _id: { $in: ids } }, { isDeleted: true });
  return presidents;
};

const countPresidents = async (query: any) => {
  const presidents = await President.count({ ...query });
  return presidents;
};

const PresidentService = {
  getPresidents,
  getPresident,
  createPresident,
  createMultiplePresidents,
  updatePresident,
  updatePresidents,
  deletePresidents,
  countPresidents,
};
export default PresidentService;
