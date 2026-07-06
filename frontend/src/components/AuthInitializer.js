import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryGet } from "kdesigns/KHooks";
import {
  logout,
  selectAuth,
  setLoading,
  setUser,
} from "../store/authSlice";
import { unwrapApiData } from "../utils/apiResponse";

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { token, user } = useSelector(selectAuth);

  const needsHydration = Boolean(token) && !user;

  const { data, isLoading, isError, isFetched } = useQueryGet({
    eventMessage: {},
    eventType: "FABNET_GET_ME",
    url: "/auth/me",
    enabled: needsHydration,
    queryKey: ["auth", "me"],
  });

  useEffect(() => {
    if (!token) {
      dispatch(setLoading(false));
      return;
    }

    // Fresh login already has user — skip /auth/me
    if (user) {
      dispatch(setLoading(false));
      return;
    }

    if (isLoading) {
      dispatch(setLoading(true));
      return;
    }

    if (isError) {
      dispatch(logout());
      return;
    }

    if (!isFetched) {
      return;
    }

    const fetchedUser = unwrapApiData(data);
    if (fetchedUser) {
      dispatch(setUser(fetchedUser));
    } else {
      dispatch(logout());
    }
  }, [data, dispatch, isError, isFetched, isLoading, token, user]);

  return children;
}
