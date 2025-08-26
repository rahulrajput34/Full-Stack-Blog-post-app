import React, { useCallback, useEffect, useState } from "react";
import { Account } from "appwrite";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Container, PostCard } from "../components";
import { Icon } from "@iconify/react/dist/iconify.js";

/**
 * Home
 * - Clean, low-chrome UI (no heavy shadows)
 * - Accessible states: aria-live / aria-busy / role=alert|status
 * - Retry action on errors
 * - Stable skeletons to avoid CLS
 * - Max 3 columns (1→2→3)
 */
function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await appwriteService.getPosts();
      setPosts(res?.documents ?? []);
    } catch (err) {
      setLoadError(err?.message || "Failed to load posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Posts load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const res = await appwriteService.getPosts();
        if (mounted) setPosts(res?.documents ?? []);
      } catch (err) {
        if (mounted) {
          setLoadError(err?.message || "Failed to load posts.");
          setPosts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Auth check
  useEffect(() => {
    let mounted = true;
    const account = new Account(appwriteService.client);
    account
      .get()
      .then(() => mounted && setIsAuthed(true))
      .catch(() => mounted && setIsAuthed(false))
      .finally(() => mounted && setAuthChecked(true));
    return () => {
      mounted = false;
    };
  }, []);

  // Lightweight skeleton (no shadows)
  const SkeletonCard = () => (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
      <div className="aspect-[16/9] w-full rounded-lg bg-slate-200" />
      <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
    </div>
  );

  return (
    <section className="w-full bg-white py-10">
      <Container>
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {loading ? "Loading posts…" : "Latest Posts"}
            </h1>
            <p
              className="mt-1 text-sm text-slate-600"
              aria-live="polite"
              aria-atomic="true"
            >
              {loading
                ? "Fetching fresh content"
                : posts.length > 0
                ? `Showing ${posts.length} ${
                    posts.length === 1 ? "post" : "posts"
                  }`
                : "No posts found."}
            </p>
          </div>
        </div>

        {/* Error */}
        {loadError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <Icon
              icon="mdi:alert-circle-outline"
              className="mt-0.5 h-5 w-5 shrink-0"
              aria-hidden="true"
            />
            <div className="flex-1">
              <p className="font-medium">Couldn’t load posts</p>
              <p className="mt-0.5">{loadError}</p>
            </div>
            <button
              type="button"
              onClick={loadPosts}
              className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
            >
              <Icon icon="mdi:refresh" className="mr-1.5 h-4 w-4" />
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty (after auth check) */}
        {!loading && posts.length === 0 && !loadError && authChecked && (
          <section className="w-full" aria-live="polite" role="status">
            {isAuthed ? (
              /* ----- Signed-in: prompt to create ----- */
              <div className="w-full rounded-2xl border border-slate-200 bg-white py-12">
                <div className="mx-auto flex max-w-xl flex-col items-center px-4 text-center">
                  <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-indigo-50 ring-1 ring-indigo-100">
                    <Icon
                      icon="mdi:pencil-plus-outline"
                      className="h-7 w-7 text-indigo-600"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Create your first blog
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    You’re signed in. Share your ideas and updates with the
                    community.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/add-post"
                      className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <Icon
                        icon="mdi:plus"
                        className="mr-1.5 h-5 w-5"
                        aria-hidden="true"
                      />
                      Add Post
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              /* ----- Logged-out: prompt to sign in ----- */
              <div className="w-full rounded-2xl border border-slate-200 bg-white py-12">
                <div className="mx-auto flex max-w-xl flex-col items-center px-4 text-center">
                  <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-slate-100 ring-1 ring-slate-200">
                    <Icon
                      icon="mdi:newspaper-variant-outline"
                      className="h-7 w-7 text-slate-700"
                      aria-hidden="true"
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Log in to add a post
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Sign in to create posts and see community updates.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      to="/login"
                      className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <Icon
                        icon="mdi:login"
                        className="mr-1.5 h-5 w-5"
                        aria-hidden="true"
                      />
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                    >
                      <Icon
                        icon="mdi:account-plus-outline"
                        className="mr-1.5 h-5 w-5"
                        aria-hidden="true"
                      />
                      Create Account
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Posts grid (max 3 columns) */}
        {!loading && posts.length > 0 && (
          <ul
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
          >
            {posts.map((post) => (
              <li key={post.$id} className="group">
                {/* subtle motion; no shadow */}
                <div className="transition-transform group-hover:-translate-y-0.5">
                  <PostCard {...post} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}

export default Home;
