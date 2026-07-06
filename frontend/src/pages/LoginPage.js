import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { KButton, KInputText, KPassword } from "kdesigns/KDesign";
import { useMutationPost } from "kdesigns/KHooks";
import "kdesigns/kDesignStyle";
import ValidatedField, { fieldClassName } from "../components/ValidatedField";
import { setCredentials, selectIsAuthenticated } from "../store/authSlice";
import { loginSchema } from "../validation/schemas";
import { unwrapApiData } from "../utils/apiResponse";
import "../styles/dashboard.css";

export default function LoginPage() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const { postData, loading } = useMutationPost({ mutationKey: ["fabnet-login"] });
  const [submitError, setSubmitError] = useState("");

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async ({ email, password }) => {
    setSubmitError("");
    try {
      const result = await postData(
        { email: email.trim(), password },
        "FABNET_LOGIN",
        "/auth/login",
      );
      const credentials = unwrapApiData(result);
      if (credentials?.token) {
        dispatch(setCredentials(credentials));
        navigate(from, { replace: true });
      }
    } catch {
      setSubmitError("Invalid email or password.");
    }
  };

  return (
    <div className="fn-login-page">
      <div className="fn-login-brand">
        <h1>FabNet Systems</h1>
        <p>
          Your unified platform for supplier management, manufacturing services,
          and client operations.
        </p>
      </div>
      <div className="fn-login-form-side">
        <div className="fn-login-card">
          <h2>Sign in</h2>
          <p className="subtitle">Enter your credentials to access the dashboard</p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-fluid">
            <ValidatedField
              name="email"
              control={control}
              label="Email address"
              htmlFor="email"
              render={(field, fieldState) => (
                <KInputText
                  id="email"
                  type="email"
                  placeholder="admin@fabnetsystems.com"
                  {...field}
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            <ValidatedField
              name="password"
              control={control}
              label="Password"
              htmlFor="password"
              render={(field, fieldState) => (
                <KPassword
                  id="password"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                  inputRef={field.ref}
                  feedback={false}
                  toggleMask
                  className={fieldClassName(fieldState)}
                />
              )}
            />
            {submitError ? (
              <small className="p-error block mb-3">{submitError}</small>
            ) : null}
            <KButton
              type="submit"
              label="Sign in to dashboard"
              className="w-full"
              loading={loading}
            />
          </form>
        </div>
      </div>
    </div>
  );
}
