import Router from 'express-promise-router';

import { handleGetCategories, handleGetCategory } from '../resources/controllers/category.ctrl';

const router = Router();

router.route('/:id').get(handleGetCategory);
router.route('/').get(handleGetCategories);

export default router;
