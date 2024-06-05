import cron from 'node-cron';

import { NODE_ENV } from '../lib/constants';
import { generateActivities } from './activity.jobs';
import { scrapePosts } from './post.jobs';

const scheduleOptions = {
  scheduled: true,
  timezone: 'Africa/Lagos',
};

const schedule = async (time: string, callback: () => Promise<void>) => {
  cron.schedule(time, async () => await callback(), scheduleOptions);
};

const start = () => {
  if (NODE_ENV === 'production') {
    // Generate summaries for posts by 06:00am
    schedule('0 6 * * *', async () => await generateActivities('06:00 am'));
    // Generate summaries for posts by 12:00 noon
    schedule('0 12 * * *', async () => await generateActivities('12:00 pm'));
    // Generate summaries for posts by 06:00pm
    schedule('0 18 * * *', async () => await generateActivities('06:00 pm'));
    // Generate summaries for posts by 11:30pm
    schedule('30 23 * * *', async () => await generateActivities('11:30 pm'));

    // Scrape posts by 06:30am
    schedule('30 6 * * *', async () => await scrapePosts('06:30 am'));
    // Scrape posts by 12:30 noon
    schedule('30 12 * * *', async () => await scrapePosts('12:30 pm'));
    // Scrape posts by 06:30pm
    schedule('30 18 * * *', async () => await scrapePosts('06:30 pm'));
    // Scrape posts by 11:59pm
    schedule('59 23 * * *', async () => await scrapePosts('11:59 pm'));
  }

  if (NODE_ENV === 'development') {
    schedule('26 01 * * *', async () => await scrapePosts('06:00 pm'));
  }
};

export default {
  start,
};
