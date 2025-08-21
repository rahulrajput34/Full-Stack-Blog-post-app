import React from "react";
import { Link } from "react-router-dom";
import Logo from "../Logo";

/**
 * Footer (light theme, accessible, professional)
 * - Uses semantic <footer> and <nav aria-label="...">.
 * - Clean light gradient background with subtle dividers.
 * - Clear column layout across breakpoints.
 * - Keyboard-friendly focus rings and refined hover states.
 */
function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-slate-200 bg-gradient-to-b from-white to-slate-50 text-slate-800">
      {/* Decorative soft tint (non-interactive) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 h-56 w-[36rem] -translate-x-1/2 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand / summary */}
          <div className="lg:col-span-5">
            <Link
              to="/"
              className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md"
            >
              <Logo width="120px" />
              <span className="sr-only">DevUI — Home</span>
            </Link>
            <p className="mt-4 max-w-md text-sm text-slate-600">
              © {year}. All rights reserved by DevUI.
            </p>
          </div>

          {/* Company */}
          <nav className="lg:col-span-2" aria-label="Company">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-sm text-sm text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-sm text-sm text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-sm text-sm text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Affiliate Program
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-sm text-sm text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Press Kit
                </Link>
              </li>
            </ul>
          </nav>

          {/* Support */}
          <nav className="lg:col-span-2" aria-label="Support">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-sm text-sm text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Account
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-sm text-sm text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Help
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-sm text-sm text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-sm text-sm text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Customer Support
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legals */}
          <nav className="lg:col-span-3" aria-label="Legals">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Legals
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-sm text-sm text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-sm text-sm text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="inline-flex items-center rounded-sm text-sm text-slate-700 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  Licensing
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom divider / caption */}
        <div className="mt-12 border-t border-slate-200 pt-6">
          <p className="text-center text-xs text-slate-500">
            Built with React &amp; Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
