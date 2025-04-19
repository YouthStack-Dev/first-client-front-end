import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './Axious';

const GlobalApi = (config) => {
  const defaultConfig = {
    baseQuery: axiosBaseQuery({
      baseUrl: 'http://fleetbackend.local:3000/',
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