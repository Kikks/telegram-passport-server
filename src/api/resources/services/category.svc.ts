import { ObjectId } from 'mongodb';

import Category from '../../../db/models/Category.model';
import ootpError from '../../lib/error';
import { generateMeta } from '../../lib/pagination';
import { ICategory, OCategory } from '../interfaces/category.intf';
import { isEmpty } from '../utils/validation';

const getCategories = async ({
  limit = 10,
  page = 1,
  query = {},
  search,
  sort = { name: 'asc' },
}: {
  query?: any;
  page?: number;
  limit?: number;
  search?: string;
  sort?: Record<any, any>;
}) => {
  const revampedSearchQuery = {
    ...(search
      ? {
          name: { $regex: isEmpty(search) ? '' : `.*${search}*.`, $options: 'i' },
        }
      : {}),
    ...query,
    isDeleted: false,
  };

  const count = await Category.count(revampedSearchQuery);
  const categories = await Category.find(revampedSearchQuery)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort(sort);

  return { categories, meta: generateMeta(page, count, limit) };
};

const getCategory = async (query: any) => {
  const category = await Category.findOne({ ...query, isDeleted: false });
  return category;
};

const createCategory = async (categoryDetails: ICategory) => {
  const category = await Category.create(categoryDetails);
  category.save();
  return category;
};

const createMultipleCategories = async (categoryDetails: ICategory[]) => {
  const categories = await Category.insertMany(categoryDetails);
  return categories;
};

const updateCategory = async ({
  query,
  categoryDetails,
}: {
  query: any;
  categoryDetails: Partial<OCategory>;
}) => {
  const category = await getCategory({ ...query, isDeleted: false });
  if (!category) throw new ootpError('No category with that id exists.', 404);

  category.set(categoryDetails);

  await category.save();

  return category;
};

const deleteCategories = async (ids: ObjectId[]) => {
  const categories = await Category.updateMany({ _id: { $in: ids } }, { isDeleted: true });
  return categories;
};

const countCategories = async (query: any) => {
  const categories = await Category.count({ ...query, isDeleted: false });
  return categories;
};

const CategoryService = {
  getCategories,
  getCategory,
  createCategory,
  createMultipleCategories,
  updateCategory,
  deleteCategories,
  countCategories,
};
export default CategoryService;
