import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Container, PostCard } from "../components";

function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const res = await appwriteService.getPosts();
        if (isMounted && res?.documents) {
          setPosts(res.documents);
        }
      } catch (err) {
        if (isMounted) setLoadError(err?.message || "Failed to load posts.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const SkeletonCard = () => (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="aspect-[16/9] w-full rounded-lg bg-slate-200" />
      <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
    </div>
  );

  return (
    <section className="w-full bg-gradient-to-b from-white to-slate-50 py-10">
      <Container>
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {loading ? "Loading posts…" : "Latest Posts"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {loading
                ? "Fetching fresh content"
                : posts.length > 0
                ? `Showing ${posts.length} ${
                    posts.length === 1 ? "post" : "posts"
                  }`
                : "No posts found."}
            </p>
          </div>
          {!loading && posts.length > 0 && (
            <Link
              to="/add-post"
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              + Add Post
            </Link>
          )}
        </div>

        {/* Error banner */}
        {loadError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {loadError}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-busy="true"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && !loadError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mb-3 text-3xl">📰</div>
            <h2 className="text-lg font-medium text-slate-900">
              Login to read posts
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-600">
              Sign in to access the latest articles and community updates.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login"
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

        {/* Posts grid */}
        {!loading && posts.length > 0 && (
          <ul
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            role="list"
          >
            {posts.map((post) => (
              <li key={post.$id} className="group">
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
