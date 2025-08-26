import React, { useCallback, useEffect, useState } from "react";
import { Container, PostCard } from "../components";
import appwriteService from "../appwrite/config";
import { Icon } from "@iconify/react/dist/iconify.js";

/**
 * AllPosts
 * - Professional, low-chrome UI (no heavy shadows)
 * - Accessible loading/empty/error states
 * - Stable skeletons to avoid CLS
 * - Max 3 columns on large screens
 */
function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      // Omit arg to use the service default (active posts)
      const res = await appwriteService.getPosts();
      setPosts(res?.documents ?? []);
    } catch (err) {
      setLoadError(err?.message || "Failed to load posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const res = await appwriteService.getPosts();
        if (!cancelled) setPosts(res?.documents ?? []);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err?.message || "Failed to load posts.");
          setPosts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Lightweight, consistent skeleton (no shadows) */
  const SkeletonCard = () => (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
      {/* Image area to prevent layout shift */}
      <div className="aspect-[16/9] w-full rounded-lg bg-slate-200" />
      <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
    </div>
  );

  return (
    <section className="w-full bg-white py-10">
      <Container>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {loading ? "Loading posts…" : "All Posts"}
          </h1>
          <p className="mt-1 text-sm text-slate-600" aria-live="polite">
            {loading
              ? "Fetching content"
              : posts.length > 0
              ? `Showing ${posts.length} ${posts.length === 1 ? "post" : "posts"}`
              : "No posts found."}
          </p>
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

        {/* Loading skeletons */}
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

        {/* Empty state */}
        {!loading && posts.length === 0 && !loadError && (
          <section className="w-full" aria-live="polite" role="status">
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
                  Nothing here yet
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Check back soon for fresh content.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Posts grid (max 3 columns) */}
        {!loading && posts.length > 0 && (
          <ul
            role="list"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {posts.map((post) => (
              <li key={post.$id} className="group">
                {/* Subtle hover translation; no shadow */}
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

export default AllPosts;
