import { Request, Response } from 'express';

import { SUCCESSFUL } from '../../lib/constants';
import ootpError from '../../lib/error';
import { failure, success } from '../../lib/response';
import { Auth0User } from '../interfaces/user.intf';
import UserService from '../services/user.svc';
import VoteService from '../services/vote.svc';
import { validateVoteActivityInputs } from '../validators/vote.vld';

const handleGetVote = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const vote = await VoteService.getVote({ _id: id });

    if (!vote) throw new ootpError('Vote not found', 404);

    return success({
      res,
      data: vote,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error: any) {
    return failure({
      res,
      message: error.message || 'An error occured while getting vote.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleVoteActivity = async (req: Request, res: Response) => {
  try {
    const activityId = req.params.activityId;
    const userObject: Auth0User = res.locals.user;
    const { type } = validateVoteActivityInputs(req, res);

    const user = await UserService.getUser({ email: userObject.email });
    if (!user) throw new ootpError('User not found', 404);

    const vote = await VoteService.getVote({ activity: activityId, createdBy: user._id });

    if (vote) {
      if (vote.type === type) {
        await VoteService.deleteVote({ _id: vote._id });
      } else {
        await VoteService.updateVote({ _id: vote._id }, { type });
      }
    } else {
      await VoteService.createVote({
        activity: activityId,
        type,
        createdBy: user._id,
        country: user.country,
      });
    }

    const upvotes = await VoteService.countVotes({ activity: activityId, type: 'upvote' });
    const downvotes = await VoteService.countVotes({ activity: activityId, type: 'downvote' });
    const aggregate = upvotes - downvotes;

    return success({
      res,
      data: {
        aggregate,
        message:
          vote?.type === type ? 'Vote removed successfully' : `Successfully ${type}d activity`,
      },
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while creating post.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const handleGetUserVoteForActivity = async (req: Request, res: Response) => {
  try {
    const activityId = req.params.activityId;
    const userObject: Auth0User = res.locals.user;
    const user = await UserService.getUser({ email: userObject.email });

    if (!user) throw new ootpError('User not found', 404);

    const vote = await VoteService.getVote({ activity: activityId, createdBy: user._id });

    return success({
      res,
      data: vote,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error) {
    return failure({
      res,
      message: error.message || 'An error occured while creating post.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

export { handleGetVote, handleVoteActivity, handleGetUserVoteForActivity };
