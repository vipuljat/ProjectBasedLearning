import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { projectApi } from '../services/projectApi';
import { persistStore } from 'redux-persist';

export const store = configureStore({
    reducer: {
        [projectApi.reducerPath]: projectApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore non-serializable values from redux-persist
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(projectApi.middleware),
});

// Set up RTK Query listeners
setupListeners(store.dispatch);

// Create persistor for PersistGate
export const persistor = persistStore(store);