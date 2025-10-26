import { configureStore } from '@reduxjs/toolkit';
import { authSlice, dashboardSlice } from './index';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    dashboard: dashboardSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
