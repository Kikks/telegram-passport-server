import Router from 'express-promise-router';

import { checkAdmin } from '../middlewares/auth';
import {
  handleCreateSource,
  handleDeleteSource,
  handleGetSource,
  handleGetSources,
  handleReplaceSource,
  handleUpdateSourceStatus,
} from '../resources/controllers/source.ctrl';

const router = Router();

router.route('/:id').get(checkAdmin, handleGetSource);
router.route('/').get(checkAdmin, handleGetSources);
router.route('/').post(checkAdmin, handleCreateSource);
router.route('/replace').post(checkAdmin, handleReplaceSource);
router.route('/:id').patch(checkAdmin, handleUpdateSourceStatus);
router.route('/').delete(checkAdmin, handleDeleteSource);

export default router;
