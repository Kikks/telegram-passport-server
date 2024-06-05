import { Request, Response } from 'express';
import Joi from 'joi';

import { validateShema } from './helpers.vld';

const createPresidentSchema = Joi.object({
  name: Joi.string().required(),
  bio: Joi.string().required(),
  duration: Joi.string().required(),
  country: Joi.string().required(),
});

const updatePresidentSchema = Joi.object({
  name: Joi.string(),
  bio: Joi.string(),
  duration: Joi.string(),
  country: Joi.string(),
});

const deletePresidentsSchema = Joi.object({
  ids: Joi.array().required(),
});

const validateCreatePresidentInputs = (req: Request, res: Response) =>
  validateShema(createPresidentSchema, req, res);
const validateUpdatePresidentInputs = (req: Request, res: Response) =>
  validateShema(updatePresidentSchema, req, res);
const validateDeletePresidentsInputs = (req: Request, res: Response) =>
  validateShema(deletePresidentsSchema, req, res);

export {
  validateCreatePresidentInputs,
  validateUpdatePresidentInputs,
  validateDeletePresidentsInputs,
};
