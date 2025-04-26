// src/features/api/projectApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const projectApi = createApi({
    reducerPath: 'projectApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8000', // replace if using another URL
    }),
    endpoints: (builder) => ({
        suggestProjects: builder.mutation({
            query: (params) => ({
                url: '/suggestProjects',
                method: 'POST',
                body: params,
            }),
        }),

        fetchProjectOverview: builder.query({
            query: (title) => `/overview/${encodeURIComponent(title)}`,
        }),

        fetchModules: builder.query({
            query: (title) => `/modules/${encodeURIComponent(title)}`,
        }),

        getModuleDetails: builder.mutation({
            query: (module) => ({
                url: '/moduleDetails',
                method: 'POST',
                body: module,
            }),
        }),

        getResources: builder.mutation({
            query: ({ title, overview }) => ({
                url: '/projectResources',
                method: 'POST',
                body: { title, overview },
            }),
        }),

        getProjects: builder.query({
            query: () => '/projects',
        }),

    }),
});

export const {
    useSuggestProjectsMutation,
    useFetchProjectOverviewQuery,
    useFetchModulesQuery,
    useGetModuleDetailsMutation,
    useGetResourcesMutation,
    useGetProjectsQuery
} = projectApi;


