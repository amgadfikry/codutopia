import { configureStore } from '@reduxjs/toolkit'
import userStateReducer from './user'

export const store = configureStore({
  reducer: {
    user: userStateReducer,
  },
})