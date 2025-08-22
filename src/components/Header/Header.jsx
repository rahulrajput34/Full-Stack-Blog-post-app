import React, { useEffect, useState, useCallback } from "react";
import { Container, Logo, LogoutBtn } from "../index";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import ConfirmDialog from "../Radix/ConfirmDialog";
import { useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import authService from "../../appwrite/auth";
import { Icon } from "@iconify/react/dist/iconify.js";

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();

  const navItems = [
    { name: "Home", slug: "/", active: true },
    { name: "My Account", slug: "/login", active: !authStatus },
    { name: "All Posts", slug: "/all-posts", active: authStatus },
    { name: "Add Post", slug: "/add-post", active: authStatus },
  ];

  const isActive = useCallback(
    (slug) => pathname === slug || pathname.startsWith(slug + "/"),
    [pathname]
  );

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const logoutHandler = () => {
    authService.logout().then(() => {
      dispatch(logout());
      navigate("/login");
    });
  };

  // Link styles
  const baseLink =
    "relative inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";
  const activeUnderline =
    "after:absolute after:-bottom-[6px] after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-indigo-500";
  const ctaLink =
    "inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

  return (
    <header className="sticky top-0">
      <Container>
        <nav
          className="flex items-center justify-between py-3"
          aria-label="Primary navigation"
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
            {navItems
              .filter((i) => i.active)
              .map((item) => {
                const active = isActive(item.slug);
                const isCta = item.slug === "/add-post" && authStatus;
                return (
                  <li key={item.name}>
                    {isCta ? (
                      <Link
                        to={item.slug}
                        aria-current={active ? "page" : undefined}
                        className={ctaLink}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <Link
                        to={item.slug}
                        aria-current={active ? "page" : undefined}
                        className={`${baseLink} ${
                          active ? activeUnderline : ""
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            {authStatus && (
              <li className="ml-1">
                <ConfirmDialog
                  title="Log out of your account?"
                  description="You’ll be signed out on this device."
                  confirmLabel="Yes, log out"
                  cancelLabel="Cancel"
                  variant="destructive"
                  onConfirm={logoutHandler}
                >
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    {/* Logout */}
                    <Icon
                      icon="material-symbols:logout-rounded"
                      width="24"
                      height="24"
                    />
                  </button>
                </ConfirmDialog>
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
            {navItems
              .filter((i) => i.active)
              .map((item) => {
                const active = isActive(item.slug);
                const isCta = item.slug === "/add-post" && authStatus;
                return (
                  <li key={item.name}>
                    {isCta ? (
                      <Link
                        to={item.slug}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className="block rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <Link
                        to={item.slug}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={`block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                          active
                            ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200"
                            : ""
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            {authStatus && (
              <li className="pt-1">
                <ConfirmDialog
                  title="Log out of your account?"
                  description="You’ll be signed out on this device."
                  confirmLabel="Yes, log out"
                  cancelLabel="Cancel"
                  variant="destructive"
                  onConfirm={logoutHandler}
                >
                  <button
                    type="button"
                    className="block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  >
                    {/* Logout */}
                    <Icon
                      icon="material-symbols:logout-rounded"
                      width="24"
                      height="24"
                    />
                  </button>
                </ConfirmDialog>
              </li>
            )}
          </ul>
        </div>
      </Container>
    </header>
  );
}

export default Header;
