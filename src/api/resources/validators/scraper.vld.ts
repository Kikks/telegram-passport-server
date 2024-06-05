import { Request, Response } from 'express';
import Joi from 'joi';

import { validateShema } from './helpers.vld';

const scraperSchema = Joi.object({
  search: Joi.string().required(),
  page: Joi.string().optional(),
});

const validateScraperSchema = (req: Request, res: Response) =>
  validateShema(scraperSchema, req, res);

export { validateScraperSchema };
