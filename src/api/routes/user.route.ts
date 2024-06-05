import Router from 'express-promise-router';

import { checkAdmin, checkUser } from '../middlewares/auth';
import { handleGetAdmin, handleGetUser, handleGetUsers } from '../resources/controllers/user.ctrl';

const router = Router();

router.route('/admin/self').get(checkAdmin, handleGetAdmin);
router.route('/self').get(checkUser, handleGetUser);
router.route('/').get(checkAdmin, handleGetUsers);

export default router;
