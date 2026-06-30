import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { KButton, KInputText, KPassword } from "kdesigns/KDesign";
import { useMutationPost } from "kdesigns/KHooks";
import "kdesigns/kDesignStyle";
import FormField from "../components/FormField";
import { setCredentials, selectIsAuthenticated } from "../store/authSlice";
import { unwrapApiData } from "../utils/apiResponse";
import "../styles/dashboard.css";

export default function LoginPage() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const { postData, loading } = useMutationPost({ mutationKey: ["fabnet-login"] });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
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
      setError("Invalid email or password.");
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
          <form onSubmit={handleSubmit} className="p-fluid">
            <FormField label="Email address" htmlFor="email">
              <KInputText
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fabnetsystems.com"
                required
              />
            </FormField>
            <FormField label="Password" htmlFor="password">
              <KPassword
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                feedback={false}
                toggleMask
                required
              />
            </FormField>
            {error ? <small className="p-error block mb-3">{error}</small> : null}
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
