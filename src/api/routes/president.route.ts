import Router from 'express-promise-router';

import { checkAdmin } from '../middlewares/auth';
import {
  handleCreatePresident,
  handleDeletePresidents,
  handleGetPresident,
  handleGetPresidents,
  handleUpdatePresident,
} from '../resources/controllers/president.ctrl';

const router = Router();

router.route('/:country').get(handleGetPresident);
router.route('/').get(handleGetPresidents);
router.route('/').post(checkAdmin, handleCreatePresident);
router.route('/:id').patch(checkAdmin, handleUpdatePresident);
router.route('/').delete(checkAdmin, handleDeletePresidents);

export default router;
