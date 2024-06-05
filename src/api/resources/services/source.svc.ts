import { ObjectId } from 'mongodb';

import Post from '../../../db/models/Post.model';
import Source from '../../../db/models/Source.model';
import ootpError from '../../lib/error';
import { generateMeta } from '../../lib/pagination';
import { ISource, OSource } from '../interfaces/source.intf';
import { isEmpty } from '../utils/validation';

const getSources = async ({
  limit = 10,
  page = 1,
  query = {},
  search,
  country,
  sort = { name: 'asc' },
}: {
  query?: any;
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  sort?: Record<any, any>;
}) => {
  const revampedSearchQuery = {
    ...(search
      ? {
          name: { $regex: isEmpty(search) ? '' : `.*${search}*.`, $options: 'i' },
        }
      : {}),
    ...(country ? { country } : {}),
    ...query,
  };

  const count = await Source.count(revampedSearchQuery);
  const sources = await Source.find(revampedSearchQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sort);

  return { sources, meta: generateMeta(page, count, limit) };
};

const getSource = async (query: any) => {
  const source = await Source.findOne({ ...query });
  return source;
};

const createSource = async (sourceDetails: ISource) => {
  const existingSource = await getSource({
    name: sourceDetails.name,
    country: sourceDetails.country,
  });
  if (existingSource) throw new ootpError('Source with that name already exists.', 400);

  const source = await Source.create(sourceDetails);
  source.save();

  await Post.updateMany({ source: source.name }, { src: new ObjectId(source._id) });

  return source;
};

const createMultipleSources = async (sourceDetails: ISource[]) => {
  const sources = await Source.insertMany(sourceDetails);
  return sources;
};

const updateSource = async ({
  query,
  sourceDetails,
}: {
  query: any;
  sourceDetails: Partial<OSource>;
}) => {
  const source = await getSource({ ...query });
  if (!source) throw new ootpError('No source with that id exists.', 404);

  source.set(sourceDetails);

  await source.save();

  return source;
};

const deleteSources = async (ids: ObjectId[]) => {
  const sources = await Source.updateMany({ _id: { $in: ids } }, { isDeleted: true });
  return sources;
};

const countSources = async (query: any) => {
  const sources = await Source.count({ ...query });
  return sources;
};

const replaceSource = async (source: string, newSourceId: string | ObjectId) => {
  await Post.updateMany({ source: source }, { src: new ObjectId(newSourceId) });
};

const SourceService = {
  getSources,
  getSource,
  createSource,
  createMultipleSources,
  updateSource,
  deleteSources,
  countSources,
  replaceSource,
};
export default SourceService;
