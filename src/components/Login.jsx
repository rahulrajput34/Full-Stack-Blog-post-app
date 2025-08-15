import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import { Button, Input, Logo } from "./index";
import { useDispatch } from "react-redux";
import authService from "../appwrite/auth";
import { useForm } from "react-hook-form";

/**
 * Login
 * -----
 * - Uses react-hook-form for validation and submission state
 * - Calls Appwrite authService.login -> getCurrentUser
 * - Dispatches authLogin(user) on success, then navigates home
 * - Accessible: focus rings, ARIA for errors, semantic copy
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

  const onSubmit = async (data) => {
    setFormError("");
    try {
      const session = await authService.login(data);
      if (session) {
        const user = await authService.getCurrentUser();
        if (user) {
          dispatch(authLogin(user));
        }
        navigate("/");
      }
    } catch (err) {
      // Show a friendly message; keep raw message when available
      setFormError(
        err?.message ||
          "Unable to log in. Please check your credentials and try again."
      );
    }
  };

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
        {/* Brand */}
        <div className="mb-6 flex justify-center">
          <span className="inline-block w-full max-w-[110px]">
            <Logo width="100%" />
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          Log in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-sm"
          >
            Sign up
          </Link>
        </p>

        {/* Top-level error */}
        {formError ? (
          <div
            className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
            aria-live="polite"
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
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  // HTML5 email type helps, but keep a sane pattern as well
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
          <Button
            type="submit"
            className="w-full"
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
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
