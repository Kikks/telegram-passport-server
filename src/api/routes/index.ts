import * as express from 'express';

import activityRouter from './activity.route';
import authRouter from './auth.route';
import categoriesRouter from './category.route';
import postRouter from './post.route';
import presidentRouter from './president.route';
import scraperRouter from './scraper.route';
import sourceRouter from './source.route';
import statsRouter from './stats.route';
import userRouter from './user.route';
import voteRouter from './vote.route';

const router = express.Router();

router.use('/activities', activityRouter);
router.use('/auth', authRouter);
router.use('/categories', categoriesRouter);
router.use('/posts', postRouter);
router.use('/presidents', presidentRouter);
router.use('/scrapers', scraperRouter);
router.use('/sources', sourceRouter);
router.use('/stats', statsRouter);
router.use('/users', userRouter);
router.use('/votes', voteRouter);

export default router;
