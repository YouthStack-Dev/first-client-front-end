import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './Axious';

const GlobalApi = (config) => {
  const defaultConfig = {
    baseQuery: axiosBaseQuery({
      baseUrl: 'http://tenant1.fleetquest:3000/api/',
    }),
    keepUnusedDataFor: 3600,
    endpoints: (builder) => ({}),
  };

  return createApi({
    ...defaultConfig,
    ...config,
  });
};

export default GlobalApi;