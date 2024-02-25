import { createSlice } from "@reduxjs/toolkit";

const userState = createSlice({
  name: "user",
  initialState: {
    "data": {},
    "auth": 'public'
  },
  reducers: {
    setUserData: (state, action) => {
      state.data = action.payload
    },
    setAuth: (state, action) => {
      state.auth = action.payload
    }
  }
})

export default userState.reducer;
export const { setUserData, setAuth } = userState.actions;
export const userData = state => state.user.data;
export const userAuth = state => state.user.auth;
