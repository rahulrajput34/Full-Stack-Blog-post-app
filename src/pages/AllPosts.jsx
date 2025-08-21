import React, { useEffect, useState } from "react";
import { Container, PostCard } from "../components";
import appwriteService from "../appwrite/config";

function AllPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        // Omit arg to use the service default (active posts)
        const res = await appwriteService.getPosts();
        if (!cancelled && res?.documents) {
          setPosts(res.documents);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err?.message || "Failed to load posts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const SkeletonCard = () => (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Reserve image space to prevent layout shift */}
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
          <p className="mt-1 text-sm text-slate-600">
            {loading
              ? "Fetching content"
              : posts.length > 0
              ? `Showing ${posts.length} ${
                  posts.length === 1 ? "post" : "posts"
                }`
              : "No posts found."}
          </p>
        </div>

        {/* Error */}
        {loadError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {loadError}
          </div>
        )}

        {/* Loading skeletons */}
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
              Nothing here yet
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-600">
              Check back soon for fresh content.
            </p>
          </div>
        )}

        {/* Posts grid */}
        {!loading && posts.length > 0 && (
          <ul
            role="list"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {posts.map((post) => (
              <li key={post.$id} className="group">
                {/* Small hover lift but no layout shift */}
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
