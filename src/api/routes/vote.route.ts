import Router from 'express-promise-router';

import { checkUser } from '../middlewares/auth';
import {
  handleGetUserVoteForActivity,
  handleGetVote,
  handleVoteActivity,
} from '../resources/controllers/vote.ctrl';

const router = Router();

router.route('/:id').get(checkUser, handleGetVote);
router.route('/activity/:activityId').post(checkUser, handleVoteActivity);
router.route('/activity/:activityId/my-vote').get(checkUser, handleGetUserVoteForActivity);

export default router;
