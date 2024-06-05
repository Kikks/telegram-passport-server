import { Request, Response } from 'express';
import Joi from 'joi';

import { validateShema } from './helpers.vld';

const createSourceSchema = Joi.object({
  name: Joi.string().required(),
  searchUrl: Joi.string().required(),
  image: Joi.string(),
  country: Joi.string().required(),
});

const updateSourceSchema = Joi.object({
  name: Joi.string(),
  searchUrl: Joi.string(),
  image: Joi.string(),
});

const deleteSourcesSchema = Joi.object({
  ids: Joi.array().required(),
});

const validateCreateSourceInputs = (req: Request, res: Response) =>
  validateShema(createSourceSchema, req, res);
const validateUpdateSourceInputs = (req: Request, res: Response) =>
  validateShema(updateSourceSchema, req, res);
const validateDeleteSourcesInputs = (req: Request, res: Response) =>
  validateShema(deleteSourcesSchema, req, res);

export { validateCreateSourceInputs, validateUpdateSourceInputs, validateDeleteSourcesInputs };
