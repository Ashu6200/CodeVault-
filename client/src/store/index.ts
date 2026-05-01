import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
// We will add other reducers here as we build features

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    // auth: authReducer,
    // workspace: workspaceReducer,
    // ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
