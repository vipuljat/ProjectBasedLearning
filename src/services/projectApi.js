import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// RTK Query API definition
const projectApiBase = createApi({
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
            keepUnusedDataFor: 86400, // Cache for 24 hours (in seconds)
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

        getAllModuleDetails: builder.query({
            query: (project_id) => `/moduleDetails/project/${encodeURIComponent(project_id)}`,
            keepUnusedDataFor: 86400, // Cache for 24 hours (in seconds)
        }),
    }),
});

// Persist configuration for RTK Query reducer
const persistConfig = {
    key: 'projectApi',
    storage,
    whitelist: ['projectApi'], // Persist only the projectApi reducer
};

// Create persisted reducer
const persistedProjectApiReducer = persistReducer(persistConfig, projectApiBase.reducer);

// Export the API with persisted reducer
export const projectApi = {
    ...projectApiBase,
    reducer: persistedProjectApiReducer,
};

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
    useGetAllModuleDetailsQuery,
} = projectApiBase;