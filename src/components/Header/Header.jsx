import React, { useState } from "react";
import { Container, Logo, LogoutBtn } from "../index";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Header (light theme, responsive, accessible)
 * - Semantic <header>/<nav> with aria-label
 * - Mobile menu toggle with keyboard-friendly focus states
 * - Active route highlighting using useLocation()
 * - Keeps your auth-driven nav logic and LogoutBtn
 */
function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: "Home", slug: "/", active: true },
    { name: "Login", slug: "/login", active: !authStatus },
    { name: "Signup", slug: "/signup", active: !authStatus },
    { name: "All Posts", slug: "/all-posts", active: authStatus },
    { name: "Add Post", slug: "/add-post", active: authStatus },
  ];

  const visibleNav = navItems.filter((i) => i.active);
  const isActive = (slug) => pathname === slug;

  // Base classes for links + active styles
  const baseLink =
    "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
  const activeLink = "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <Container>
        <nav
          className="flex items-center justify-between py-3"
          aria-label="Primary"
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Logo width="90px" />
              <span className="sr-only">DevUI — Home</span>
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="ml-2 inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 md:hidden"
            aria-controls="primary-menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Toggle menu</span>
            {/* Hamburger / Close icon */}
            {open ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-1 md:flex">
            {visibleNav.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.slug}
                  aria-current={isActive(item.slug) ? "page" : undefined}
                  className={`${baseLink} ${
                    isActive(item.slug) ? activeLink : ""
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {authStatus && (
              <li className="ml-1">
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile menu panel */}
        <div
          id="primary-menu"
          className={`md:hidden ${open ? "block" : "hidden"}`}
        >
          <ul className="mt-2 space-y-1 border-t border-slate-200 pt-2">
            {visibleNav.map((item) => (
              <li key={item.name}>
                {/* Use Link (preferred) but still okay to navigate() if you want side-effects */}
                <Link
                  to={item.slug}
                  aria-current={isActive(item.slug) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isActive(item.slug)
                      ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                      : ""
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            {authStatus && (
              <li className="pt-1">
                <LogoutBtn />
              </li>
            )}
          </ul>
        </div>
      </Container>
    </header>
  );
}

export default Header;
