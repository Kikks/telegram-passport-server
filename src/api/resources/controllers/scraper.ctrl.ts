import { Request, Response } from 'express';

import { SUCCESSFUL } from '../../lib/constants';
import { failure, success } from '../../lib/response';
import ScraperService from '../services/scraper.svc';
import { validateScraperSchema } from '../validators/scraper.vld';

const handleScrapeWikipediaForPresidents = async (req: Request, res: Response) => {
  try {
    const presidents = await ScraperService.scrapeWikipediaForPresidents();

    return success({
      res,
      data: presidents,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error: any) {
    return failure({
      res,
      message: error.message || 'An error occured while scraping post.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

const scrapperControllerWrapper = (scrapper: any) => async (req: Request, res: Response) => {
  try {
    const { search, page } = validateScraperSchema(req, res);
    const posts = await scrapper({ search, page });

    return success({
      res,
      data: posts,
      message: SUCCESSFUL,
      httpCode: 200,
    });
  } catch (error: any) {
    return failure({
      res,
      message: error.message || 'An error occured while scraping post.',
      errStack: error.stack,
      httpCode: error.code || 500,
    });
  }
};

// Nigerian Sources
const handleScrapeArise = scrapperControllerWrapper(ScraperService.scrapeArise);
const handleScrapeThePunch = scrapperControllerWrapper(ScraperService.scrapeThePunch);
const handleScrapeTheGuardian = scrapperControllerWrapper(ScraperService.scrapeTheGuardian);
const handleScrapeVanguard = scrapperControllerWrapper(ScraperService.scrapeVanguard);
const handleScrapeSaharaReporters = scrapperControllerWrapper(ScraperService.scrapeSaharaReporters);
const handleScrapeStateHouse = scrapperControllerWrapper(ScraperService.scrapeStateHouse);
const handleScrapeBusinessDay = scrapperControllerWrapper(ScraperService.scrapeBusinessDay);

// Gambia Sources
const handleScrapeStandard = scrapperControllerWrapper(ScraperService.scrapeStandard);
const handleScrapeThePoint = scrapperControllerWrapper(ScraperService.scrapeThePoint);

// Ghana Sources
const handleScrapeCitiNewsroom = scrapperControllerWrapper(ScraperService.scrapeCitiNewsroom);
const handleScrapeGhanaOnline = scrapperControllerWrapper(ScraperService.scrapeGhanaOnline);

// Kenya Sources
const handleScrapeKenyaOOTP = scrapperControllerWrapper(ScraperService.scrapeKenyaOOTP);
const handleScrapeTheStar = scrapperControllerWrapper(ScraperService.scrapeTheStar);
const handleScrapeNairobiLeo = scrapperControllerWrapper(ScraperService.scrapeNairobiLeo);
const handleScrapeKenyans = scrapperControllerWrapper(ScraperService.scrapeKenyans);

// Liberian Sources
const handleScrapeLiberianObserver = scrapperControllerWrapper(
  ScraperService.scrapeLiberianObserver
);
const handleScrapeExecutiveMansion = scrapperControllerWrapper(
  ScraperService.scrapeExecutiveMansion
);

// Sierra Leone Sources
const handleScrapeAwokoNewspaper = scrapperControllerWrapper(ScraperService.scrapeAwokoNewspaper);
const handleScrapeSLStateHouse = scrapperControllerWrapper(ScraperService.scrapeSLStateHouse);
const handleScrapeTheSierraLeoneTelegraph = scrapperControllerWrapper(
  ScraperService.scrapeTheSierraLeoneTelegraph
);

export {
  handleScrapeWikipediaForPresidents,
  // Nigerian Sources
  handleScrapeArise,
  handleScrapeThePunch,
  handleScrapeTheGuardian,
  handleScrapeVanguard,
  handleScrapeSaharaReporters,
  handleScrapeStateHouse,
  handleScrapeBusinessDay,
  // Gambia Sources
  handleScrapeStandard,
  handleScrapeThePoint,
  // Ghana Sources
  handleScrapeCitiNewsroom,
  handleScrapeGhanaOnline,
  // Kenya Sources
  handleScrapeKenyaOOTP,
  handleScrapeTheStar,
  handleScrapeNairobiLeo,
  handleScrapeKenyans,
  // Liberian Sources
  handleScrapeLiberianObserver,
  handleScrapeExecutiveMansion,
  // Sierra Leone Sources
  handleScrapeAwokoNewspaper,
  handleScrapeSLStateHouse,
  handleScrapeTheSierraLeoneTelegraph,
};
