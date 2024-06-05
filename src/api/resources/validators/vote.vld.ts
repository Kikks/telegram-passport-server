import { Request, Response } from 'express';
import Joi from 'joi';

import { validateShema } from './helpers.vld';

const voteActivitySchema = Joi.object({
  type: Joi.string().valid('upvote', 'downvote').required(),
});

const validateVoteActivityInputs = (req: Request, res: Response) =>
  validateShema(voteActivitySchema, req, res);

export { validateVoteActivityInputs };
