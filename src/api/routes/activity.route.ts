import Router from 'express-promise-router';

import { checkAdmin } from '../middlewares/auth';
import {
  handleDeleteActivities,
  handleGenerateActivities,
  handleGetActivities,
  handleGetActivity,
  handleUpdateActivity,
} from '../resources/controllers/activity.ctrl';

const router = Router();

router.route('/').get(handleGetActivities);
router.route('/:id').get(handleGetActivity);
router.route('/:id').patch(checkAdmin, handleUpdateActivity);
router.route('/').delete(checkAdmin, handleDeleteActivities);
router.route('/generate').post(checkAdmin, handleGenerateActivities);

export default router;
