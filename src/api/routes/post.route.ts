import Router from 'express-promise-router';

import { checkAdmin } from '../middlewares/auth';
import {
  handleCreatePost,
  handleDeletePost,
  handleGetPost,
  handleGetPosts,
  handleUpdatePostStatus,
} from '../resources/controllers/post.ctrl';

const router = Router();

router.route('/:id').get(checkAdmin, handleGetPost);
router.route('/').get(checkAdmin, handleGetPosts);
router.route('/').post(checkAdmin, handleCreatePost);
router.route('/:id').patch(checkAdmin, handleUpdatePostStatus);
router.route('/').delete(checkAdmin, handleDeletePost);

export default router;
