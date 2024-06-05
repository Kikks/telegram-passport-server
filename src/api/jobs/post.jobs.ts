import moment from 'moment-timezone';

import { logger } from '../../config/winston';
import ScraperService from '../resources/services/scraper.svc';

const get24HoursRange = (time: string) => ({
  startTime: moment(time, 'hh:mm a').tz('Africa/Lagos').startOf('day').toISOString(),
  endTime: moment(time, 'hh:mm a').tz('Africa/Lagos').toISOString(),
});

const scrapePosts = async (time: string) => {
  try {
    logger.info(`################# Running a job at ${time} at Africa/Lagos timezone`);
    logger.info('################# Scrapping posts...');

    const scraperPromises = [
      // Nigerian Sources Scappers
      ScraperService.scrapeArise({
        search: 'Tinubu',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeTheGuardian({
        search: 'President Tinubu',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeThePunch({
        search: 'President Tinubu',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeStateHouse({
        search: 'President Tinubu',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeBusinessDay({
        search: 'President Tinubu',
        ...get24HoursRange(time),
      }),

      // Gambia Sources Scrappers
      ScraperService.scrapeStandard({
        search: 'President Adama Barrow',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeThePoint({
        search: 'President Adama Barrow',
        ...get24HoursRange(time),
      }),

      // Ghana Sources Scrappers
      ScraperService.scrapeCitiNewsroom({
        search: 'President Nana Akufo-Addo',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeGhanaOnline({
        search: 'President Nana Akufo-Addo',
        ...get24HoursRange(time),
      }),

      // Kenya Sources Scrappers
      ScraperService.scrapeKenyaOOTP({
        search: 'President William Ruto',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeTheStar({
        search: 'President William Ruto',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeNairobiLeo({
        search: 'President William Ruto',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeKenyans({
        search: 'President William Ruto',
        ...get24HoursRange(time),
      }),

      // Liberian Sources Scrappers
      ScraperService.scrapeLiberianObserver({
        search: 'President George Weah',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeExecutiveMansion({
        search: 'President George Weah',
        ...get24HoursRange(time),
      }),

      // Sierra Leone Sources Scrappers
      ScraperService.scrapeAwokoNewspaper({
        search: 'President Julius Maada Bio',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeSLStateHouse({
        search: 'President Julius Maada Bio',
        ...get24HoursRange(time),
      }),
      ScraperService.scrapeTheSierraLeoneTelegraph({
        search: 'President Julius Maada Bio',
        ...get24HoursRange(time),
      }),
    ];
    const responses = await Promise.allSettled(scraperPromises);
    logger.info(responses);
    logger.info(`################# Completed scrapping posts.`);
  } catch (error) {
    logger.info('################# Error scrapping posts...');
    logger.info(error);
  }
};

export { scrapePosts };
