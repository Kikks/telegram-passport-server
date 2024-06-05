export const corsWhitelist: string[] = ['*'];

export const { NODE_ENV, PORT } = process.env;
export const SUCCESSFUL = 'successful';
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string;

export const countries = {
  Nigeria: {
    name: 'Nigeria',
    code: 'NG',
  },
  Ghana: {
    name: 'Ghana',
    code: 'GH',
  },
  Liberia: {
    name: 'Liberia',
    code: 'LR',
  },
  Gambia: {
    name: 'Gambia',
    code: 'GM',
  },
  Kenya: {
    name: 'Kenya',
    code: 'KE',
  },
  SierraLeone: {
    name: 'Sierra Leone',
    code: 'SL',
  },
};

export const defaultCategories = [
  'policy',
  'economic',
  'social',
  'infrastructure',
  'foreign',
  'public',
  'environment',
  'transparency',
  'ethics',
  'crisis',
  'communication',
  'media',
  'judiciary',
  'education',
  'healthcare',
];

export const categoryEmojis = {
  policy: '📜',
  economic: '💰',
  social: '🤝',
  infrastructure: '🏗️',
  foreign: '🌍',
  public: '🏛️',
  environment: '🌳',
  transparency: '🕵️‍♂️',
  ethics: '🤔',
  crisis: '🆘',
  communication: '📢',
  media: '📰',
  judiciary: '⚖️',
  education: '🎓',
  healthcare: '🏥',
};

export const nigerianNewsSources = {
  'Arise News': {
    url: 'https://www.arise.tv',
    name: 'Arise News',
  },
  'The Punch': {
    url: 'https://www.punchng.com',
    name: 'The Punch',
  },
  'The Guardian Nigeria': {
    url: 'https://www.guardian.ng',
    name: 'The Guardian Nigeria',
  },

  Vanguard: {
    url: 'https://www.vanguardngr.com',
    name: 'Vanguard',
  },
  'Sahara Reporters': {
    url: 'https://www.saharareporters.com',
    name: 'Sahara Reporters',
  },
  'State House': {
    url: 'https://statehouse.gov.ng',
    name: 'State House',
  },
  'Business Day': {
    url: 'https://businessday.ng',
    name: 'Business Day',
  },
};

export const gambiaNewsSources = {
  'The Standard': {
    url: 'https://standard.gm',
    name: 'Standard',
  },
  'The Point': {
    url: 'https://thepoint.gm',
    name: 'The Point',
  },
};

export const ghanaNewsSources = {
  'Citi Newsroom': {
    url: 'https://citinewsroom.com',
    name: 'Citi Newsroom',
  },
  'Ghana Online': {
    url: 'https://www.gbcghanaonline.com',
    name: 'Ghana Online',
  },
  'Office of The President': {
    url: 'https://presidency.gov.gh',
    name: 'Office of The President',
  },
};

export const kenyaNewsSources = {
  'The Star': {
    url: 'https://www.the-star.co.ke',
    name: 'The Star',
  },
  Nairobileo: {
    url: 'https://nairobileo.co.ke',
    name: 'Nairobileo',
  },
  'Office of the president': {
    url: 'https://president.go.ke',
    name: 'Office of the president',
  },
  Kenyans: {
    url: 'https://www.kenyans.co.ke',
    name: 'Kenyans',
  },
};

export const liberianNewsSources = {
  'Liberian Observer': {
    url: 'https://www.liberianobserver.com',
    name: 'Liberian Observer',
  },
  'Executive Mansion': {
    url: 'https://emansion.gov.lr',
    name: 'Executive Mansion',
  },
};

export const sierraLeoneNewsSources = {
  'Awoko Newspaper': {
    url: 'https://awokonewspaper.sl',
    name: 'Awoko Newspaper',
  },
  'Sierria Leone State House': {
    url: 'https://statehouse.gov.sl',
    name: 'Sierria Leone State House',
  },
  'The Sierra Leone Telegraph': {
    url: 'https://www.thesierraleonetelegraph.com',
    name: 'The Sierra Leone Telegraph',
  },
};

export type NigerianNewsSourcesType = keyof typeof nigerianNewsSources;
export type GambiaNewsSourcesType = keyof typeof gambiaNewsSources;
export type GhanaNewsSourcesType = keyof typeof ghanaNewsSources;
export type KenyaNewsSourcesType = keyof typeof kenyaNewsSources;
export type LiberianNewsSourcesType = keyof typeof liberianNewsSources;
export type SierraLeoneNewsSourcesType = keyof typeof sierraLeoneNewsSources;
export type CategoryEmoji = keyof typeof categoryEmojis;

type NigeriaNewsSource = { country: 'Nigeria'; sourceName: NigerianNewsSourcesType };
type GambiaNewsSource = { country: 'Gambia'; sourceName: GambiaNewsSourcesType };
type GhanaNewsSource = { country: 'Ghana'; sourceName: GhanaNewsSourcesType };
type KenyaNewsSource = { country: 'Kenya'; sourceName: KenyaNewsSourcesType };
type LiberianNewsSources = { country: 'Liberia'; sourceName: LiberianNewsSourcesType };
type SierraLeoneNewsSources = { country: 'Sierra Leone'; sourceName: SierraLeoneNewsSourcesType };

export type NewsSource =
  | NigeriaNewsSource
  | GambiaNewsSource
  | GhanaNewsSource
  | KenyaNewsSource
  | LiberianNewsSources
  | SierraLeoneNewsSources;
