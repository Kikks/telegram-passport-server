import Router from 'express-promise-router';

import { checkAdmin } from '../middlewares/auth';
import {
  handleScrapeArise,
  handleScrapeAwokoNewspaper,
  handleScrapeBusinessDay,
  handleScrapeCitiNewsroom,
  handleScrapeExecutiveMansion,
  handleScrapeGhanaOnline,
  handleScrapeKenyans,
  handleScrapeKenyaOOTP,
  handleScrapeLiberianObserver,
  handleScrapeNairobiLeo,
  handleScrapeSaharaReporters,
  handleScrapeSLStateHouse,
  handleScrapeStandard,
  handleScrapeStateHouse,
  handleScrapeTheGuardian,
  handleScrapeThePoint,
  handleScrapeThePunch,
  handleScrapeTheSierraLeoneTelegraph,
  handleScrapeTheStar,
  handleScrapeVanguard,
  handleScrapeWikipediaForPresidents,
} from '../resources/controllers/scraper.ctrl';

const router = Router();

router.route('/wikipedia').post(checkAdmin, handleScrapeWikipediaForPresidents);

// Nigerian Sources
router.route('/arise').post(checkAdmin, handleScrapeArise);
router.route('/business-day').post(checkAdmin, handleScrapeBusinessDay);
router.route('/the-punch').post(checkAdmin, handleScrapeThePunch);
router.route('/state-house').post(checkAdmin, handleScrapeStateHouse);
router.route('/the-guardian').post(checkAdmin, handleScrapeTheGuardian);
router.route('/vanguard').post(checkAdmin, handleScrapeVanguard);
router.route('/sahara-reporters').post(checkAdmin, handleScrapeSaharaReporters);

// Gambia Sources
router.route('/standard').post(checkAdmin, handleScrapeStandard);
router.route('/the-point').post(checkAdmin, handleScrapeThePoint);

// Ghana Sources
router.route('/citi-newsroom').post(checkAdmin, handleScrapeCitiNewsroom);
router.route('/ghana-online').post(checkAdmin, handleScrapeGhanaOnline);

// Kenya Sources
router.route('/kenya-ootp').post(checkAdmin, handleScrapeKenyaOOTP);
router.route('/the-star').post(checkAdmin, handleScrapeTheStar);
router.route('/nairobi-leo').post(checkAdmin, handleScrapeNairobiLeo);
router.route('/kenyans').post(checkAdmin, handleScrapeKenyans);

// Liberian Sources
router.route('/liberian-observer').post(checkAdmin, handleScrapeLiberianObserver);
router.route('/executive-mansion').post(checkAdmin, handleScrapeExecutiveMansion);

// Sierra Leone Sources
router.route('/awoko-newspaper').post(checkAdmin, handleScrapeAwokoNewspaper);
router.route('/sl-state-house').post(checkAdmin, handleScrapeSLStateHouse);
router.route('/the-sierra-leone-telegraph').post(checkAdmin, handleScrapeTheSierraLeoneTelegraph);

export default router;
