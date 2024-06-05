import { Request, Response } from 'express';
import Joi from 'joi';

import { validateShema } from './helpers.vld';

const createPostSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
  publishedAt: Joi.string().required(),
  src: Joi.string().required(),
  url: Joi.string().required(),
  country: Joi.string().required(),
});

const updatePostSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved').required(),
});

const deletePostsSchema = Joi.object({
  ids: Joi.array().required(),
});

const validateCreatePostInputs = (req: Request, res: Response) =>
  validateShema(createPostSchema, req, res);
const validateUpdatePostInputs = (req: Request, res: Response) =>
  validateShema(updatePostSchema, req, res);
const validateDeletePostsInputs = (req: Request, res: Response) =>
  validateShema(deletePostsSchema, req, res);

export { validateCreatePostInputs, validateUpdatePostInputs, validateDeletePostsInputs };
