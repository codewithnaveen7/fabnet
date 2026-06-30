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
  const { token } = useSelector(selectAuth);

  const { data, isLoading, isError } = useQueryGet({
    eventMessage: {},
    eventType: "FABNET_GET_ME",
    url: "/auth/me",
    enabled: Boolean(token),
    queryKey: ["auth", "me"],
  });

  useEffect(() => {
    if (!token) {
      dispatch(setLoading(false));
      return;
    }
    dispatch(setLoading(isLoading));
  }, [dispatch, isLoading, token]);

  useEffect(() => {
    const user = unwrapApiData(data);
    if (user) {
      dispatch(setUser(user));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (isError && token) {
      dispatch(logout());
    }
  }, [dispatch, isError, token]);

  return children;
}
