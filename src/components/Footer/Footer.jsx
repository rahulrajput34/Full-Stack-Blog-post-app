import React from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import Logo from "../Logo";

/**
 * Ultra-minimal responsive footer:
 * - Left: brand + "Rahul Rajput — All rights reserved"
 * - Right: social/project icon links (Iconify)
 * - Stacks on small screens, single row on larger screens
 */
function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          {/* Brand + caption */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              aria-label="DevUI Home"
              className="inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Logo width="110px" />
              <span className="sr-only">DevUI — Home</span>
            </Link>
            <span className="text-xs text-slate-600">
              © {year} Rahul Rajput — All rights reserved
            </span>
          </div>

          {/* Icons */}
          <nav aria-label="Social and project links">
            <ul className="flex items-center gap-2">
              {/* Replace href values with your real links */}
              <li>
                <a
                  href="https://www.linkedin.com/in/rahulrajput34/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                  className="rounded-md p-2 text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <Icon icon="mdi:linkedin" className="w-7 h-7" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/rahulrajput34"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  title="GitHub"
                  className="rounded-md p-2 text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <Icon icon="mdi:github" className="w-7 h-7" />
                </a>
              </li>
              <li>
                <a
                  href="https://your-portfolio.site"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Portfolio"
                  title="Portfolio"
                  className="rounded-md p-2 text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <Icon icon="mdi:earth" className="w-7 h-7" />
                </a>
              </li>
              <li>
                <a
                  href="https://ecommerce-project.demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="E-commerce Project"
                  title="E-commerce Project"
                  className="rounded-md p-2 text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <Icon icon="mdi:cart-outline" className="w-7 h-7" />
                </a>
              </li>
              <li>
                <a
                  href="https://library-management.demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Library Management Project"
                  title="Library Management Project"
                  className="rounded-md p-2 text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <Icon icon="mdi:book-open-variant" className="w-7 h-7" />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
