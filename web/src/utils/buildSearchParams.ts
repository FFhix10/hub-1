import isNull from 'lodash/isNull';

import { SearchFiltersURL } from '../types';

const WHITELISTED_FILTER_KEYS = [
  'org', // Organization as publisher
  'user', // User as publisher
  'capabilities', // Capability level: Basic Install, Seamless Upgrades, Full Lifecycle, Deep Insights, Auto Pilot
  'kind', // Repository kind
  'repo', // Repository name
  'license', // Package license
];

interface F {
  [key: string]: string[];
}

export default (query: string): SearchFiltersURL => {
  const p = new URLSearchParams(query);
  let filters: F = {};

  p.forEach((value, key) => {
    if (WHITELISTED_FILTER_KEYS.includes(key)) {
      const values = filters[key] || [];
      values.push(value);
      filters[key] = values;
    }
  });

  return {
    tsQueryWeb: p.has('ts_query_web') ? p.get('ts_query_web')! : undefined,
    tsQuery: p.has('ts_query') ? p.get('ts_query')!.split(' | ')! : undefined,
    filters: { ...filters },
    pageNumber: p.has('page') && !isNull(p.get('page')) ? parseInt(p.get('page')!) : 1,
    deprecated: p.has('deprecated') ? p.get('deprecated') === 'true' : false,
    operators: p.has('operators') ? p.get('operators') === 'true' : undefined,
    verifiedPublisher: p.has('verified_publisher') ? p.get('verified_publisher') === 'true' : undefined,
    official: p.has('official') ? p.get('official') === 'true' : undefined,
    sort: p.has('sort') ? p.get('sort') : undefined,
  };
};
