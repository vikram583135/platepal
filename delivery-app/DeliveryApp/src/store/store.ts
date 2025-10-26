import { configureStore } from '@reduxjs/toolkit';
import { authSlice, tasksSlice, locationSlice } from './index';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    tasks: tasksSlice.reducer,
    location: locationSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
