import { Browser, launch } from 'puppeteer';

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance) {
    browserInstance = await launch({
      headless: true,
      defaultViewport: null,
      args: ['--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true,
    });
  }

  return browserInstance;
}

export { getBrowser };
