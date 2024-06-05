import { logger } from '../../config/winston';
import ActivityService from '../resources/services/activity.svc';
import PostService from '../resources/services/post.svc';

const generateActivities = async (time: string) => {
  try {
    logger.info(`################# Running a job at ${time} at Africa/Lagos timezone`);
    logger.info('################# Generating summaries...');

    const unprocessPosts = await PostService.getPosts({
      query: { isProcessed: false, status: 'approved' },
      limit: 100,
    });
    const activities = await ActivityService.generateActivities(unprocessPosts.posts);
    logger.info(`################# ${activities.length} post(s) summarized successfully...`);
  } catch (error) {
    logger.info('################# Error generating summaries...');
    logger.info(error);
  }
};

export { generateActivities };
