import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import { Input, Logo } from "./index";
import { useDispatch } from "react-redux";
import authService from "../appwrite/auth";
import { useForm } from "react-hook-form";

/**
 * Login
 * - Validates with react-hook-form and shows inline errors
 * - Authenticates via Appwrite (authService.login -> getCurrentUser)
 * - Dispatches authLogin(user) and navigates home on success
 * - Accessible form semantics and focus rings
 * @return {JSX.Element}
 */
function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const [formError, setFormError] = useState("");

  /**
   * Handle login submit
   * @param {{email: string, password: string}} data
   * @return {Promise<void>}
   */
  const onSubmit = async (data) => {
    setFormError("");
    try {
      const session = await authService.login(data);
      if (session) {
        const user = await authService.getCurrentUser();
        if (user) dispatch(authLogin(user));
        navigate("/");
      }
    } catch (err) {
      setFormError(
        err?.message ||
          "Unable to log in. Please check your credentials and try again."
      );
    }
  };

  // Button styles
  const btnBase =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnPrimary = "w-full bg-indigo-600 text-white hover:bg-indigo-700";

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
        {/* Brand (perfectly centered) */}
        <div className="mb-6 grid place-items-center">
          <Link
            to="/"
            aria-label="Home"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <Logo width="120px" />
          </Link>
        </div>

        {/* Heading */}
        <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          Log in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="rounded-sm font-medium text-indigo-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Sign up
          </Link>
        </p>

        {/* Top-level error */}
        {formError ? (
          <div
            className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
            aria-live="assertive"
          >
            {formError}
          </div>
        ) : null}

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-6 space-y-5"
        >
          {/* Email */}
          <div>
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              aria-invalid={errors.password ? "true" : "false"}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />
            {errors.password && (
              <p id="password-error" className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`${btnBase} ${btnPrimary}`}
            disabled={isSubmitting}
            aria-busy={isSubmitting ? "true" : "false"}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Logging in…
              </span>
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
