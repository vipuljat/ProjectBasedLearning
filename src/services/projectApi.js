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

        getDiagram: builder.mutation({
            query: ({ module_title, steps }) => ({
                url: '/diagrams',
                method: 'POST',
                body: { module_title, steps },
            }),
        }),

        getStoredDiagrams: builder.query({
            query: (project_title) => `/diagrams/${encodeURIComponent(project_title)}`,
        }),

        getUserPreferences: builder.query({
            query: (studentId) => `userPreferences/${studentId}`,
        }),

        // New query to fetch all pre-generated module details for a project
        getAllModuleDetails: builder.query({
            query: (project_id) => `/moduleDetails/project/${encodeURIComponent(project_id)}`,
        }),
    }),
});

export const {
    useSuggestProjectsMutation,
    useFetchProjectOverviewQuery,
    useFetchModulesQuery,
    useGetModuleDetailsMutation,
    useGetResourcesMutation,
    useGetProjectsQuery,
    useGetDiagramMutation,
    useGetStoredDiagramsQuery,
    useGetUserPreferencesQuery,
    useGetAllModuleDetailsQuery, // Add the new hook
} = projectApi;