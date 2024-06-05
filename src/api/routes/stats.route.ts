import Router from 'express-promise-router';

import { checkAdmin } from '../middlewares/auth';
import {
  handleGetActivityStats,
  handleGetCategoryStats,
  handleGetPostStats,
  handleGetSourceStats,
  handleGetUserStats,
  handleGetVoteStats,
} from '../resources/controllers/stats.ctrl';

const router = Router();

router.route('/activity').get(checkAdmin, handleGetActivityStats);
router.route('/category').get(checkAdmin, handleGetCategoryStats);
router.route('/post').get(checkAdmin, handleGetPostStats);
router.route('/source').get(checkAdmin, handleGetSourceStats);
router.route('/user').get(checkAdmin, handleGetUserStats);
router.route('/vote').get(checkAdmin, handleGetVoteStats);

export default router;
