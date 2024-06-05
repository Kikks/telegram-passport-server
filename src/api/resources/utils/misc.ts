import {
  countries,
  gambiaNewsSources,
  GambiaNewsSourcesType,
  ghanaNewsSources,
  GhanaNewsSourcesType,
  kenyaNewsSources,
  KenyaNewsSourcesType,
  liberianNewsSources,
  LiberianNewsSourcesType,
  NewsSource,
  nigerianNewsSources,
  NigerianNewsSourcesType,
  sierraLeoneNewsSources,
  SierraLeoneNewsSourcesType,
} from '../../../api/lib/constants';

export const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
};

export const sanitizeText = (str: string) => {
  return str.replace(/(\r\n|\n|\r)/gm, '').trim();
};

export const isWithinTimeframe = (
  date: moment.Moment,
  startTime: moment.Moment,
  endTime: moment.Moment
) => {
  if (date === startTime || date === endTime) {
    return true;
  }

  return date.isBetween(startTime, endTime);
};

export const getNewsSource: (
  args: NewsSource
) => {
  url: string;
  name: string;
  code: string;
} = ({ country, sourceName }) => {
  switch (country) {
    case 'Nigeria':
      return {
        ...nigerianNewsSources[sourceName as NigerianNewsSourcesType],
        code: countries.Nigeria.code,
      };
    case 'Gambia':
      return {
        ...gambiaNewsSources[sourceName as GambiaNewsSourcesType],
        code: countries.Gambia.code,
      };
    case 'Ghana':
      return {
        ...ghanaNewsSources[sourceName as GhanaNewsSourcesType],
        code: countries.Ghana.code,
      };
    case 'Kenya':
      return {
        ...kenyaNewsSources[sourceName as KenyaNewsSourcesType],
        code: countries.Kenya.code,
      };
    case 'Liberia':
      return {
        ...liberianNewsSources[sourceName as LiberianNewsSourcesType],
        code: countries.Liberia.code,
      };
    case 'Sierra Leone':
      return {
        ...sierraLeoneNewsSources[sourceName as SierraLeoneNewsSourcesType],
        code: countries.SierraLeone.code,
      };
    default:
      return {
        ...nigerianNewsSources[sourceName as NigerianNewsSourcesType],
        code: countries.Nigeria.code,
      };
  }
};
