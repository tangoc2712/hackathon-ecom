// redux/api/stats.api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { StatsResponse } from '../../types/api-types';


export const statsApi = createApi({
    reducerPath: 'statsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_SERVER_URL}/api/v1/stats/`,
        credentials: 'include',
    }),
    endpoints: (builder) => ({
        getStats: builder.query<StatsResponse, void>({
            query: () => '',
        }),
    }),
});

export const {
    useGetStatsQuery,
} = statsApi;
