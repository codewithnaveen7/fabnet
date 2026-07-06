import { createSlice } from "@reduxjs/toolkit";
import { getToken, removeToken, setToken } from "../utils/storage";

const initialState = {
  token: getToken(),
  user: null,
  loading: Boolean(getToken()),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.loading = false;
      setToken(token);
    },
    setUser(state, action) {
      state.user = action.payload;
      state.loading = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.loading = false;
      removeToken();
    },
  },
});

export const { setCredentials, setUser, setLoading, logout } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectUser = (state) => state.auth.user;
export const selectRole = (state) => state.auth.user?.role;
export const selectAuthLoading = (state) => state.auth.loading;

/** True while token exists but user profile is not loaded yet (e.g. after reload). */
export const selectAuthBootstrapping = (state) => {
  const { token, user, loading } = state.auth;
  return Boolean(token) && (loading || !user);
};

export default authSlice.reducer;
