import Router from 'express-promise-router';

import { checkUser } from '../middlewares/auth';
import {
  handleLogin,
  handleLoginAdmin,
  handleRegisterAdmin,
} from '../resources/controllers/auth.ctrl';

const router = Router();

router.route('/login').post(checkUser, handleLogin);
router.route('/admin/login').post(handleLoginAdmin);
router.route('/admin/register').post(handleRegisterAdmin);

export default router;
