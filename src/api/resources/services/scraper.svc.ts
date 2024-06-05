import axios, { AxiosResponse } from 'axios';
import { CheerioAPI, load } from 'cheerio';
import https from 'https';
import moment from 'moment-timezone';
import { Page } from 'puppeteer';

import { countries, kenyaNewsSources, liberianNewsSources, NewsSource } from '../../lib/constants';
import { IPost } from '../interfaces/post.intf';
import { IPresident } from '../interfaces/president.intf';
import { OSource } from '../interfaces/source.intf';
import { getBrowser } from '../utils/browser';
import { getNewsSource, isWithinTimeframe, sanitizeText } from '../utils/misc';
import { isEmpty } from '../utils/validation';
import PostService from './post.svc';
import PresidentService from './president.svc';
import SourceService from './source.svc';

type ScraperParams = {
  search: string;
  page?: string;
  startTime?: string;
  endTime?: string;
};

const scrapeWikipediaForPresidents = async () => {
  const response = await axios.get('https://en.wikipedia.org/wiki/List_of_state_leaders_in_2023');
  const $ = load(response.data);
  const countries = $('.mw-parser-output > ul').first().children();

  const scrapedData: IPresident[] = [];

  for (let i = 0; i < countries.length; i++) {
    const country = $(countries[i]).find('li > b > a').text();
    const president = $(countries[i]).find('li > ul > li').first().text();
    const splitContent = president.split(' –');

    const presidentTitle = splitContent[1]?.trim();
    const presidentName = sanitizeText(presidentTitle?.split(',')?.[0] || '');

    const presidentDuration = presidentTitle?.split(',')?.[1];
    const splitDuration = presidentDuration?.split(' ');
    const duration = (splitDuration?.[splitDuration.length - 1] || '')
      ?.replaceAll('(', '')
      ?.replaceAll(')', '');

    scrapedData.push({
      country,
      duration,
      name: presidentName,
    });
  }

  const presidents = await PresidentService.createMultiplePresidents(scrapedData);
  return presidents;
};

const scraperWrapper = async ({
  postUrlQuerySelector,
  postsQuerySelector,
  searchQuery,
  newsSource,
  postCreator,
  startTime,
  endTime,
  pass,
  useRejectUnauthorized,
  urlPrefix,
}: {
  postUrlQuerySelector: string;
  postsQuerySelector: string;
  searchQuery: string;
  newsSource: NewsSource;
  search: string;
  postCreator: (cheerio: CheerioAPI) => { post: IPost; date: moment.Moment };
  pass?: (post: IPost) => boolean | undefined;
  startTime?: string;
  endTime?: string;
  useRejectUnauthorized?: boolean;
  urlPrefix?: string;
}) => {
  try {
    const { url, name, code } = getNewsSource(newsSource);

    let source: OSource | null;
    source = await SourceService.getSource({ name, country: code });

    if (!source) {
      source = await SourceService.createSource({
        name,
        searchUrl: url,
        country: code,
      });
    }

    let response: AxiosResponse<any, any>;

    if (useRejectUnauthorized) {
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });
      response = await axios.get(`${source.searchUrl}${searchQuery}`, {
        httpsAgent,
      });
    } else {
      response = await axios.get(`${source.searchUrl}${searchQuery}`);
    }

    const $ = load(response.data);
    const posts = $(postsQuerySelector);

    const scrapedPostDetails: IPost[] = [];

    const urls: (string | undefined)[] = [];
    for (let i = 0; i < posts.length; i++) {
      const postUrl = $(posts[i]).find(postUrlQuerySelector).attr('href');
      if (postUrl) {
        urls.push($(posts[i]).find(postUrlQuerySelector).attr('href'));
      }
    }

    let scraperPromise: Promise<AxiosResponse<any, any>>[];

    if (useRejectUnauthorized) {
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
      });

      scraperPromise = urls.map((url) =>
        axios.get(url as string, {
          httpsAgent,
        })
      );
    } else {
      scraperPromise = urls.map((url) =>
        axios.get(`${urlPrefix ? `${urlPrefix}${url}` : url}` as string)
      );
    }

    const responses = await Promise.allSettled(scraperPromise);
    const htmls = responses.filter(
      (response) => response.status === 'fulfilled' && response?.value
    ) as PromiseFulfilledResult<any>[];
    const $s = htmls.map((html) => load(html.value?.data));

    console.log({
      posts: posts.length,
      urls,
      responses,
    });

    for (let i = 0; i < $s.length; i++) {
      const { post, date } = postCreator($s[i]);

      const begin = startTime
        ? moment(startTime).tz('Africa/Lagos')
        : moment().tz('Africa/Lagos').startOf('day');
      const end = endTime
        ? moment(endTime).tz('Africa/Lagos')
        : moment().tz('Africa/Lagos').endOf('day');

      const existingPost = await PostService.getPost({ title: post.title, src: source._id });
      if (existingPost) {
        continue;
      }

      const passCheck = pass ? pass(post) : true;
      if (isWithinTimeframe(date, begin, end) && passCheck) {
        scrapedPostDetails.push({
          ...post,
          src: source._id,
          url: urlPrefix ? `${urlPrefix}${urls[i]}` : urls[i],
        });
      }
    }

    await PostService.createMultiplePosts(scrapedPostDetails);
    return scrapedPostDetails;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const jsScraperWrapper = async ({
  postsContainerQuerySelector,
  postUrlQuerySelector,
  postsQuerySelector,
  searchQuery,
  newsSource,
  postCreator,
  startTime,
  endTime,
  pass,
  preScapeFunction,
  urlPrefix,
}: {
  postsContainerQuerySelector: string;
  postUrlQuerySelector: string;
  postsQuerySelector: string;
  searchQuery: string;
  newsSource: NewsSource;
  search: string;
  postCreator: (cheerio: CheerioAPI) => { post: IPost; date: moment.Moment };
  pass?: (post: IPost) => boolean | undefined;
  startTime?: string;
  endTime?: string;
  preScapeFunction?: (page: Page) => Promise<void>;
  urlPrefix?: string;
}) => {
  try {
    const { url, name, code } = getNewsSource(newsSource);

    let source: OSource | null;
    source = await SourceService.getSource({ name, country: code });

    if (!source) {
      source = await SourceService.createSource({
        name,
        searchUrl: url,
        country: code,
      });
    }

    const scrapedPostDetails: IPost[] = [];

    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.goto(`${source.searchUrl}${searchQuery}`, {
      waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector(postsContainerQuerySelector);

    if (preScapeFunction) {
      await preScapeFunction(page);
    }

    const urls = await page.$$eval(`${postsQuerySelector} ${postUrlQuerySelector}`, (posts) => {
      const links = posts.map((el: any) => el.href);
      return links;
    });

    const scraperPromise = urls.map((url) => axios.get(urlPrefix ? `${urlPrefix}${url}` : url));
    const responses = await Promise.allSettled(scraperPromise);
    const htmls = responses.filter(
      (response) => response.status === 'fulfilled' && response?.value
    ) as PromiseFulfilledResult<any>[];
    const $s = htmls.map((html) => load(html.value?.data));

    for (let i = 0; i < $s.length; i++) {
      const { post, date } = postCreator($s[i]);

      const begin = startTime
        ? moment(startTime).tz('Africa/Lagos')
        : moment().tz('Africa/Lagos').startOf('day');
      const end = endTime
        ? moment(endTime).tz('Africa/Lagos')
        : moment().tz('Africa/Lagos').endOf('day');

      const existingPost = await PostService.getPost({ title: post.title, src: source._id });
      if (existingPost) {
        continue;
      }

      const passCheck = pass ? pass(post) : true;
      if (isWithinTimeframe(date, begin, end) && passCheck) {
        scrapedPostDetails.push({
          ...post,
          src: source._id,
          url: urlPrefix ? `${urlPrefix}${urls[i]}` : urls[i],
        });
      }
    }

    page.close();
    browser.close();

    await PostService.createMultiplePosts(scrapedPostDetails);
    return scrapedPostDetails;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// ////////////////////////////////////// Nigerian Sources
const scrapeArise = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Nigeria', sourceName: 'Arise News' },
    searchQuery: `${params?.page ? `/page/${params?.page}` : ''}/?s=${params.search.replaceAll(
      ' ',
      '+'
    )}`,
    postsQuerySelector: 'div#arise_loop_content > article.snippet',
    postUrlQuerySelector: '.article-content h3 a',
    postCreator: ($: CheerioAPI) => {
      const article = $('article#single_article');
      const articleDate = article.find('header.single-article-header span.date').text();
      const articleTitle = article.find('h1.article-title').text();
      const paragraphs = article.find('div.article-content p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        articleContent += $(paragraphs[j]).text();
      }

      const parsedDate = moment(articleDate, 'hh:mm, Do MMM, YYYY').tz('Africa/Lagos');

      return {
        post: {
          title: sanitizeText(articleTitle),
          publishedAt: parsedDate.toDate(),
          content: sanitizeText(articleContent),
          country: countries.Nigeria.code,
        },
        date: parsedDate,
      };
    },
  });

const scrapeThePunch = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Nigeria', sourceName: 'The Punch' },
    searchQuery: `/?s=${params.search.replaceAll(' ', '+')}`,
    postsQuerySelector: '.latest-news-timeline-section .post-title',
    postUrlQuerySelector: 'a',
    postCreator: ($: CheerioAPI) => {
      const article = $('article.single-article');
      const articleDate = article.find('span.post-date').text();
      const articleTitle = article.find('h1.post-title').text();
      const articleContent = article.find('div.post-content').text();

      const parsedDate = moment(sanitizeText(articleDate), 'Do MMMM YYYY').tz('Africa/Lagos');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Nigeria.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeTheGuardian = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Nigeria', sourceName: 'The Guardian Nigeria' },
    searchQuery: `/?s=${params.search.replaceAll(' ', '+')}${
      params?.page ? `&page=${params.page}` : ''
    }`,
    postsQuerySelector: '.design-article .image',
    postUrlQuerySelector: 'a',
    pass: (post) =>
      post.title?.toLocaleLowerCase()?.includes('president') ||
      post.title?.toLocaleLowerCase()?.includes('tinubu'),
    postCreator: ($: CheerioAPI) => {
      const article = $('main.page-main');
      const articleDate = article.find('div.article-header .subhead .date').text();
      const articleTitle = article.find('h1.title').text();
      const articleContent = article.find('.mix-layout .single-article .content article').text();

      const strippedDate = sanitizeText(articleDate).replaceAll('&nbsp;', '').replaceAll(' ', '');
      const parts = strippedDate.split('|');

      const datePart = parts[0].replaceAll(/'/g, '');
      const timePart = parts[1];

      const formattedInput = `${datePart} ${timePart}`;

      const parsedDate = moment(formattedInput, 'DMMMMYYYY h:mma').tz('Africa/Lagos');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Nigeria.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeVanguard = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Nigeria', sourceName: 'Vanguard' },
    searchQuery: `?s=${params.search.replaceAll(' ', '+')}&custom_search=1`,
    postsQuerySelector: '.section-archive-bottom .entry-title',
    postUrlQuerySelector: 'a',
    postCreator: ($: CheerioAPI) => {
      const article = $('.content-area');
      const articleDate = article.find('p.entry-excerpt-date').text();
      const articleTitle = article.find('h2.entry-heading').text();
      const articleContent = article.find('div.entry-content-inner-wrapper').text();

      const parsedDate = moment(sanitizeText(articleDate), 'MMMM D, YYYY').tz('Africa/Lagos');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Nigeria.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeSaharaReporters = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Nigeria', sourceName: 'Sahara Reporters' },
    searchQuery: `/search?search_api_fulltext=${params.search.replaceAll(' ', '+')}`,
    postsQuerySelector: '.views-element-container .card-content .title',
    postUrlQuerySelector: 'a',
    postCreator: ($: CheerioAPI) => {
      const article = $('.column.group-middle');
      const articleTitle = $('#block-octavia-sahara-page-title').find('h1.title').text();
      const articleDate = $('#.column.is-3.group-left').first().find('div').text();
      const articleContent = article.find('.content.story').text();

      const parsedDate = moment(sanitizeText(articleDate), 'MMMM D, YYYY').tz('Africa/Lagos');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Nigeria.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeStateHouse = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Nigeria', sourceName: 'State House' },
    searchQuery: `${params?.page ? `/page/${params?.page}` : ''}?s=${params.search.replaceAll(
      ' ',
      '+'
    )}`,
    postsQuerySelector: 'div.row.masonry__container div.masonry__item',
    postUrlQuerySelector: 'div.masonry__item a',
    postCreator: ($: CheerioAPI) => {
      const article = $('div.main-container .container .row article');
      const articleMetaData = article.find('.article__title span');
      const articleDate = $(articleMetaData[0]).text();
      const articleTitle = article.find('.article__title h1.h2').text();

      const paragraphs = article.find('.article__body.post-content p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        articleContent += $(paragraphs[j]).text();
      }

      const parsedDate = moment(articleDate, 'MMMM DD, YYYY').tz('Africa/Lagos');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Nigeria.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeBusinessDay = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Nigeria', sourceName: 'Business Day' },
    searchQuery: `${params?.page ? `/page/${params?.page}` : ''}/?s=${params.search.replaceAll(
      ' ',
      '+'
    )}`,
    postsQuerySelector: 'div.news div.post-info',
    postUrlQuerySelector: 'h2.post-title a',
    pass: (post) =>
      post.title?.toLocaleLowerCase()?.includes('president') ||
      post.title?.toLocaleLowerCase()?.includes('tinubu'),
    postCreator: ($: CheerioAPI) => {
      const article = $('main');
      const articleDate = article.find('.post-meta p.post-date').text();
      const articleTitle = article.find('h1.post-title').text();
      const paragraphs = article.find('article .post-content p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        articleContent += $(paragraphs[j]).text();
      }

      const parsedDate = moment(articleDate, 'MMMM DD, YYYY').tz('Africa/Lagos');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Nigeria.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });
// ////////////////////////////////////// Nigerian Sources

// ////////////////////////////////////// Gambian Sources
const scrapeStandard = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Gambia', sourceName: 'The Standard' },
    searchQuery: `?s=${params.search.replaceAll(' ', '+')}`,
    postsQuerySelector: '.tdb_module_loop .td-module-container .td-image-container',
    postUrlQuerySelector: '.td-module-thumb a.td-image-wrap',
    postCreator: ($: CheerioAPI) => {
      const article = $('article.post.status-publish');
      const articleDate = article.find('.tdb-post-meta time.entry-date').text();
      const articleTitle = article.find('div.tdb_title h1.tdb-title-text').text();
      const paragraphs = article.find('div.td-post-content p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        articleContent += $(paragraphs[j]).text();
      }

      const parsedDate = moment(articleDate, 'MMMM DD, YYYY').tz('Africa/Banjul');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Gambia.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeThePoint = async (params: ScraperParams) =>
  jsScraperWrapper({
    ...params,
    newsSource: { country: 'Gambia', sourceName: 'The Point' },
    searchQuery: `/search?q=${params.search.replaceAll(' ', '+')}`,
    postsContainerQuerySelector: '.gsc-resultsbox-visible',
    postsQuerySelector: '.gsc-webResult.gsc-result',
    postUrlQuerySelector: 'div.gsc-thumbnail-inside div.gs-title > a',
    async preScapeFunction(page) {
      await page.click(
        'td.gsc-orderby-container div.gsc-selected-option-container.gsc-inline-block'
      );
      await page.$$eval('td.gsc-orderby-container div.gsc-option-menu-item div.gsc-option', (els) =>
        els?.[1]?.click()
      );

      await page.waitForTimeout(3000);
    },
    pass: (post) => !isEmpty(post.title) && !isEmpty(post.content),
    postCreator: ($: CheerioAPI) => {
      const article = $('[role="main"]');
      const articleDate = article.find('div.hero-banner > .container p').text();
      const articleTitle = article.find('div.hero-banner > .container h1.hero-title').text();
      const paragraphs = $('[role="main"] > .container').find('p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        articleContent += $(paragraphs[j]).text();
      }

      const parsedDate = moment(articleDate, 'MMM DD, YYYY, h:mm A').tz('Africa/Banjul');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Gambia.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });
// ////////////////////////////////////// Gambian Sources

// ////////////////////////////////////// Ghana Sources
const scrapeCitiNewsroom = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Ghana', sourceName: 'Citi Newsroom' },
    searchQuery: `${params?.page ? `/page/${params?.page}` : ''}/?s=${params.search.replaceAll(
      ' ',
      '+'
    )}`,
    postsQuerySelector: 'article.jeg_post.jeg_pl_md_2',
    postUrlQuerySelector: 'h3.jeg_post_title a',
    postCreator: ($: CheerioAPI) => {
      const article = $('div.jeg_main_content');
      const articleTitle = article.find('div.entry-header h1.jeg_post_title').text();
      const articleDate = article
        .find('div.entry-header div.jeg_meta_container div.jeg_meta_date')
        .text();
      const paragraphs = article.find('div.entry-content.no-share div.content-inner p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        articleContent += $(paragraphs[j]).text();
      }

      const parsedDate = moment(
        isEmpty(articleDate) ? moment().format('MMMM DD, YYYY') : sanitizeText(articleDate),
        'MMMM DD, YYYY'
      ).tz('Africa/Accra');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Ghana.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeGhanaOnline = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Ghana', sourceName: 'Ghana Online' },
    searchQuery: `${params?.page ? `/page/${params?.page}` : ''}/?s=${params.search.replaceAll(
      ' ',
      '+'
    )}`,
    postsQuerySelector: 'article.elementor-post',
    postUrlQuerySelector: 'h4.elementor-post__title a',
    postCreator: ($: CheerioAPI) => {
      const article = $('div.e-con-inner div.elementor-element-899710f');
      const articleTitle = article.find('h1.elementor-heading-title.elementor-size-default').text();
      const articleDate = article.find('span.elementor-post-info__item--type-date').text();
      const paragraphs = article.find(
        '[data-widget_type="theme-post-content.default"] .elementor-widget-container > p'
      );
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        articleContent += $(paragraphs[j]).text();
      }

      const parsedDate = moment(articleDate, 'MMMM DD, YYYY').tz('Africa/Accra');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Ghana.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });
// ////////////////////////////////////// Ghana Sources

// ////////////////////////////////////// Kenya Sources
const scrapeKenyaOOTP = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Kenya', sourceName: 'Office of the president' },
    searchQuery: `${params?.page ? `/page/${params?.page}` : ''}?s=${params.search.replaceAll(
      ' ',
      '+'
    )}`,
    useRejectUnauthorized: true,
    postsQuerySelector: 'li.bricks-layout-item.repeater-item',
    postUrlQuerySelector: 'div.content-wrapper h3.dynamic a',
    pass: (post) => !isEmpty(post.title) && !isEmpty(post.content),
    postCreator: ($: CheerioAPI) => {
      const article = $('main#brx-content');
      const articleTitle = article.find('section.brxe-section h1.brxe-post-title').text();
      const articleDate = article.find('div.brxe-post-meta.post-meta span.item').text();
      const paragraphs = article.find('div.brxe-post-content p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        articleContent += $(paragraphs[j]).text();
      }

      const parsedDate = moment(articleDate, 'MMMM DD, YYYY').tz('Africa/Nairobi');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Kenya.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeTheStar = async (params: ScraperParams) =>
  jsScraperWrapper({
    ...params,
    newsSource: { country: 'Kenya', sourceName: 'The Star' },
    searchQuery: `/search/?query=${params.search.replaceAll(' ', '+')}`,
    postsContainerQuerySelector: 'div#search #articles .results .articles-result-item',
    postsQuerySelector: '#search #articles .results .articles-result-item',
    postUrlQuerySelector: 'div.article-body a',
    postCreator: ($: CheerioAPI) => {
      const article = $('div#article');
      const articleTitle = article.find('.article-header h1.article-title').text();
      const articleDate = article
        .find('div.article-body .article-meta > div.article-published')
        .first()
        .text();
      const paragraphs = article.find('.article-body .article-widget-text .text p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        articleContent += $(paragraphs[j]).text();
      }

      const parsedDate = moment(articleDate, 'DD MMMM YYYY - hh:mm').tz('Africa/Nairobi');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Kenya.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeNairobiLeo = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Kenya', sourceName: 'Nairobileo' },
    searchQuery: `/search?query=${params.search.replaceAll(' ', '+')}`,
    postsQuerySelector: '.container #more-stories .row.post',
    postUrlQuerySelector: 'h4.fw-bold a',
    pass: (post) =>
      post.title?.toLowerCase().includes('president') ||
      post.title?.toLowerCase().includes('william') ||
      post.title?.toLowerCase().includes('ruto'),
    postCreator: ($: CheerioAPI) => {
      const article = $('main.container');
      const articleTitle = article.find('h1.fw-bold').text();
      const articleDate = article.find('small span.text-muted').text();
      const paragraphs = article.find('div.post-content p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        articleContent += $(paragraphs[j]).text();
      }

      const parsedDate = moment(articleDate, 'MMM DD, YYYY at hh:mm A').tz('Africa/Nairobi');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Kenya.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeKenyans = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Kenya', sourceName: 'Kenyans' },
    searchQuery: `/search?search=${params.search.replaceAll(
      ' ',
      '+'
    )}&sort_by=date&sort_order=DESC${params?.page ? `&page=${params.page}` : ''}`,
    postsQuerySelector: 'div.views-element-container .view-content .search-wrapper ul li',
    postUrlQuerySelector: 'h2.search-title a',
    urlPrefix: kenyaNewsSources.Kenyans.url,
    postCreator: ($: CheerioAPI) => {
      const article = $('div.layout-content');
      const articleTitle = article.find('h1.page-title').text();
      const articleDate = article.find('span.article-date').text();
      const paragraphs = article.find('.layout .text-formatted.field p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        articleContent += $(paragraphs[j]).text();
      }

      const parsedDate = moment(articleDate, 'dddd, DD MMMM YYYY - hh:mm A').tz('Africa/Nairobi');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Kenya.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });
// ////////////////////////////////////// Kenya Sources

// ////////////////////////////////////// Liberian Sources
const scrapeLiberianObserver = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Liberia', sourceName: 'Liberian Observer' },
    searchQuery: `/search?sort_by=published_at&search_api_fulltext=${params.search.replaceAll(
      ' ',
      '+'
    )}${params?.page ? `&page=${params.page}` : ''}}`,
    postsQuerySelector: '.views-row.listing--articles__item',
    postUrlQuerySelector: 'article a',
    pass: (post) =>
      post.title?.toLowerCase().includes('president') ||
      post.title?.toLowerCase().includes('weah') ||
      post.title?.toLowerCase().includes('goeroge'),
    urlPrefix: liberianNewsSources['Liberian Observer'].url,
    postCreator: ($: CheerioAPI) => {
      const article = $('#main #block-liberianobserver-content .content');
      const articleTitle = article.find('h1.article--header__title').text();
      const articleDate = article
        .find('.container > .article-meta span.article-meta__published-at')
        .text()
        .split('Published at:')?.[1];
      const paragraphs = article.find('.text-formatted.field p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        const text = $(paragraphs[j]).text();
        if (text) {
          articleContent += text;
        }
      }

      const parsedDate = moment(articleDate, 'MM/DD/YYYY - hh:mm').tz('Africa/Monrovia');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Liberia.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeExecutiveMansion = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Liberia', sourceName: 'Executive Mansion' },
    searchQuery: `/search/node?keys=${params.search.replaceAll(' ', '+')}${
      params?.page ? `&page=${params.page}` : ''
    }}`,
    postsQuerySelector: '.region-content ol li',
    postUrlQuerySelector: 'h3 a',
    postCreator: ($: CheerioAPI) => {
      const article = $('.region-content');
      const articleTitle = article.find('.field--name-node-title h2').text();
      const articleDate = article.find('.field--name-field-content-post-date time').text();
      const paragraphs = article.find('.field--name-field-add-paragraph p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        const text = $(paragraphs[j]).text();
        if (text) {
          articleContent += text;
        }
      }

      const parsedDate = moment(articleDate, 'dddd, MMMM DD, YYYY').tz('Africa/Monrovia');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.Liberia.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });
// ////////////////////////////////////// Liberian Sources

// ////////////////////////////////////// Sierra Leone Sources
const scrapeAwokoNewspaper = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Sierra Leone', sourceName: 'Awoko Newspaper' },
    searchQuery: `${params?.page ? `/page=${params.page}` : ''}/?s=${params.search.replaceAll(
      ' ',
      '+'
    )}`,
    postsQuerySelector: 'div.jeg_posts article.jeg_post',
    postUrlQuerySelector: 'h3.jeg_post_title a',
    postCreator: ($: CheerioAPI) => {
      const article = $('div.jeg_content.jeg_singlepage div.jeg_main_content');
      const articleTitle = article.find('h1.jeg_post_title').text();
      const articleDate = article.find('.jeg_meta_date a').text();
      const paragraphs = article.find('.content-inner p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        const text = $(paragraphs[j]).text();
        if (text) {
          articleContent += text;
        }
      }

      const parsedDate = moment(articleDate, 'DD/MM/YYYY').tz('Africa/Freetown');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.SierraLeone.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeSLStateHouse = async (params: ScraperParams) =>
  scraperWrapper({
    ...params,
    newsSource: { country: 'Sierra Leone', sourceName: 'Sierria Leone State House' },
    searchQuery: `${params?.page ? `/page=${params.page}` : ''}/?s=${params.search.replaceAll(
      ' ',
      '+'
    )}`,
    postsQuerySelector: 'div.main article.post',
    postUrlQuerySelector: 'header h2.post-title a',
    postCreator: ($: CheerioAPI) => {
      const article = $('[data-elementor-type="single-post"]');
      const articleTitle = article.find('h1.elementor-heading-title').text();
      const articleDate = article.find('span.elementor-post-info__item--type-date').text();
      const articleTime = article.find('span.elementor-post-info__item--type-time').text();
      const paragraphs = article.find(
        'div.elementor-widget-theme-post-content div.elementor-widget-container p'
      );
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        const text = $(paragraphs[j]).text();
        if (text) {
          articleContent += text;
        }
      }

      const parsedDate = moment(`${articleDate} - ${articleTime}`, 'MMMM DD, YYYY - hh:mm A').tz(
        'Africa/Freetown'
      );

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.SierraLeone.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

const scrapeTheSierraLeoneTelegraph = async (params: ScraperParams) =>
  jsScraperWrapper({
    ...params,
    newsSource: { country: 'Sierra Leone', sourceName: 'The Sierra Leone Telegraph' },
    searchQuery: `/?s=${params.search.replaceAll(
      ' ',
      '%20'
    )}&year_post_date=2023-01-01%2000%3A00%3A00&post_types=post&sort=newest
    `,
    postsContainerQuerySelector:
      '.jetpack-instant-search__search-result.jetpack-instant-search__search-result-expanded',
    postsQuerySelector:
      '.jetpack-instant-search__search-result.jetpack-instant-search__search-result-expanded',
    postUrlQuerySelector: 'h3.jetpack-instant-search__search-result-title a',
    postCreator: ($: CheerioAPI) => {
      const article = $('div#main-content article');
      const articleTitle = article.find('header.entry-header h1.entry-title').text();
      const articleDate = article.find('header.entry-header span.entry-meta-date a').text();
      const paragraphs = article.find('div.entry-content p');
      let articleContent = '';
      for (let j = 0; j < paragraphs.length; j++) {
        const text = $(paragraphs[j]).text();
        if (text) {
          articleContent += text;
        }
      }

      const parsedDate = moment(articleDate, 'MMMM DD, YYYY').tz('Africa/Freetown');

      return {
        post: {
          title: sanitizeText(articleTitle),
          content: sanitizeText(articleContent),
          country: countries.SierraLeone.code,
          publishedAt: parsedDate.toDate(),
        },
        date: parsedDate,
      };
    },
  });

// ////////////////////////////////////// Sierra Leone Sources

const ScraperService = {
  scrapeWikipediaForPresidents,
  // Nigerian Sources
  scrapeArise,
  scrapeThePunch,
  scrapeTheGuardian,
  scrapeVanguard,
  scrapeSaharaReporters,
  scrapeStateHouse,
  scrapeBusinessDay,
  // Gambian Sources
  scrapeStandard,
  scrapeThePoint,
  // Ghana Sources
  scrapeCitiNewsroom,
  scrapeGhanaOnline,
  // Kenya Sources
  scrapeKenyaOOTP,
  scrapeTheStar,
  scrapeNairobiLeo,
  scrapeKenyans,
  // Liberian Sources
  scrapeLiberianObserver,
  scrapeExecutiveMansion,
  // Sierra Leone Sources
  scrapeSLStateHouse,
  scrapeAwokoNewspaper,
  scrapeTheSierraLeoneTelegraph,
};

export default ScraperService;
