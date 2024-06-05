import { Request, Response } from 'express';
import Joi from 'joi';

import { validateShema } from './helpers.vld';

const updateActivitySchema = Joi.object({
  isPublished: Joi.boolean().required(),
});

const deleteActivitiesSchema = Joi.object({
  ids: Joi.array().required(),
});

const validateUpdateActivityInputs = (req: Request, res: Response) =>
  validateShema(updateActivitySchema, req, res);
const validateDeleteActivitiesInputs = (req: Request, res: Response) =>
  validateShema(deleteActivitiesSchema, req, res);

export { validateUpdateActivityInputs, validateDeleteActivitiesInputs };
