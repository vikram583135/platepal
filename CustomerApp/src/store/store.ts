import { configureStore } from '@reduxjs/toolkit';
import { authSlice, cartSlice, ordersSlice } from './index';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartSlice.reducer,
    orders: ordersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
