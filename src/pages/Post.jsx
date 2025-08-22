import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import parse from "html-react-parser";
import { Icon } from "@iconify/react";
import appwriteService from "../appwrite/config";
import { Container } from "../components";

/**
 * Post (full redesign, using plain <button>)
 * - Hero banner with image + gradient overlay.
 * - Overlapped content card with refined typography (prose).
 * - Top hero action bar for Back/Share; in-card author tools for Edit/Delete.
 * - Robust image fallback (preview -> view -> placeholder).
 */
export default function Post() {
  const [post, setPost] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [imgDead, setImgDead] = useState(false);
  const [copied, setCopied] = useState(false);

  const { slug } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const isAuthor = post && userData ? post.userID === userData.$id : false;

  // Fetch the post
  useEffect(() => {
    if (!slug) return navigate("/");
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const doc = await appwriteService.getPost(slug);
        if (!alive) return;
        if (doc) setPost(doc);
        else navigate("/");
      } catch (e) {
        if (alive) setLoadError(e?.message || "Failed to load post.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug, navigate]);

  // Image URLs (preview -> view)
  const previewUrl = useMemo(() => {
    if (!post?.featuredImage) return null;
    try {
      const url = appwriteService.getFilePreview(post.featuredImage);
      return typeof url === "string" ? url : url?.toString();
    } catch {
      return null;
    }
  }, [post?.featuredImage]);

  const viewUrl = useMemo(() => {
    if (
      !post?.featuredImage ||
      typeof appwriteService.getFileView !== "function"
    )
      return null;
    try {
      const url = appwriteService.getFileView(post.featuredImage);
      return typeof url === "string" ? url : url?.toString();
    } catch {
      return null;
    }
  }, [post?.featuredImage]);

  const imgSrc = !imgDead ? (!useFallback ? previewUrl : viewUrl) : null;

  // Meta computed values
  const statusClasses = useMemo(() => {
    const s = (post?.status || "active").toLowerCase();
    const map = {
      active: "border-emerald-200 bg-emerald-50 text-emerald-700",
      draft: "border-amber-200 bg-amber-50 text-amber-700",
      inactive: "border-slate-200 bg-slate-50 text-slate-600",
    };
    return map[s] || map.active;
  }, [post?.status]);

  const updatedAt = useMemo(
    () => (post?.$updatedAt ? new Date(post.$updatedAt) : null),
    [post?.$updatedAt]
  );

  const readingMins = useMemo(() => {
    if (!post?.content || typeof post.content !== "string") return 1;
    const text = post.content
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const words = text ? text.split(" ").length : 0;
    return Math.max(1, Math.round(words / 200));
  }, [post?.content]);

  // button class helpers
  const btnBase =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnSecondary =
    "bg-white text-slate-800 border border-slate-200 hover:bg-slate-100";
  const btnPrimary = "bg-indigo-600 text-white hover:bg-indigo-700";
  const btnDangerOutline =
    "bg-white border border-red-200 text-red-600 hover:bg-red-50 focus-visible:ring-red-300";

  // Actions
  const handleDelete = async () => {
    if (!post) return;
    if (!window.confirm("Delete this post?")) return;
    try {
      const ok = await appwriteService.deletePost(post.$id);
      if (ok && post.featuredImage) {
        try {
          await appwriteService.deleteFile(post.featuredImage);
        } catch {}
      }
      navigate("/");
    } catch (e) {
      alert(e?.message || "Failed to delete.");
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: post?.title || "Post", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {}
  };

  // Loading state (sleek skeleton)
  if (loading) {
    return (
      <div className="relative">
        <div className="h-[38vh] w-full bg-gradient-to-br from-indigo-50 to-slate-100" />
        <Container>
          <div className="relative -mt-14">
            <div className="mx-auto max-w-3xl animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
              <div className="h-7 w-2/3 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
              <div className="mt-6 space-y-3">
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-11/12 rounded bg-slate-200" />
                <div className="h-4 w-5/6 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // Error / Not found
  if (loadError || !post) {
    return (
      <div className="py-10">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError || "Post not found."}
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`${btnBase} ${btnSecondary}`}
            >
              <Icon icon="mdi:arrow-left" className="mr-1.5 h-5 w-5" />
              Back
            </button>
          </div>
        </Container>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="relative">
      {/* HERO */}
      <div className="relative h-[42vh] w-full overflow-hidden bg-slate-100">
        {/* Image */}
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={post.title || "Cover image"}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => {
              if (!useFallback && viewUrl) setUseFallback(true);
              else setImgDead(true);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500">
            <Icon icon="mdi:image-off-outline" className="mr-2 h-6 w-6" />
            <span>Image unavailable</span>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/35 to-transparent" />

        {/* Top bar (Back + Share) */}
        <div className="relative z-10">
          <Container>
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className={`${btnBase} ${btnSecondary} bg-white/90 backdrop-blur`}
                >
                  <Icon icon="mdi:arrow-left" className="mr-1.5 h-5 w-5" />
                  Back
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share or copy link"
                  className={`${btnBase} ${btnSecondary} bg-white/90 backdrop-blur`}
                >
                  <Icon icon="mdi:share-variant" className="mr-1.5 h-5 w-5" />
                  Share
                </button>
                {copied && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    Link copied
                  </span>
                )}
              </div>
            </div>

            {/* Breadcrumbs + Title area */}
            <div className="mt-10 max-w-4xl text-white">
              <nav className="text-sm text-white/90" aria-label="Breadcrumb">
                <ol className="flex items-center gap-2">
                  <li>
                    <Link to="/" className="hover:underline">
                      Home
                    </Link>
                  </li>
                  <li aria-hidden="true" className="opacity-75">
                    /
                  </li>
                  <li>
                    <Link to="/all-posts" className="hover:underline">
                      Posts
                    </Link>
                  </li>
                </ol>
              </nav>

              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                {post.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/90">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 ${statusClasses} border-white/30 bg-white/10 text-white`}
                >
                  {post.status || "active"}
                </span>
                <span className="opacity-80">•</span>
                <span className="opacity-90">{readingMins} min read</span>
                {updatedAt && (
                  <>
                    <span className="opacity-80">•</span>
                    <time dateTime={post.$updatedAt} className="opacity-90">
                      Updated {updatedAt.toLocaleString()}
                    </time>
                  </>
                )}
              </div>
            </div>
          </Container>
        </div>
      </div>

      {/* CONTENT CARD (overlapping) */}
      <Container>
        <article className="relative z-10 mx-auto -mt-16 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Author tools */}
          {isAuthor && (
            <div className="flex items-center justify-end gap-2 border-b border-slate-200 bg-slate-50/60 px-4 py-3">
              {/* Style Link as a button to avoid nested interactive elements */}
              <Link
                to={`/edit-post/${post.$id}`}
                className={`${btnBase} ${btnSecondary}`}
              >
                <Icon icon="mdi:pencil-outline" className="mr-1.5 h-5 w-5" />
                Edit
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                className={`${btnBase} ${btnDangerOutline}`}
              >
                <Icon icon="mdi:trash-can-outline" className="mr-1.5 h-5 w-5" />
                Delete
              </button>
            </div>
          )}

          {/* Body */}
          <div className="px-6 pb-10 pt-6 sm:px-8">
            {/* Lead / kicker */}
            <div className="mb-6 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
              <div className="flex flex-wrap items-center gap-3">
                <Icon icon="mdi:information-outline" className="h-5 w-5" />
                <span className="truncate">
                  You’re reading a post on our platform. Share it if you find it
                  helpful.
                </span>
              </div>
            </div>

            {/* Rich content */}
            <section className="prose prose-slate max-w-none prose-img:rounded-xl prose-img:border prose-img:border-slate-200 prose-blockquote:border-l-indigo-400 prose-a:text-indigo-600 hover:prose-a:text-indigo-700">
              {typeof post.content === "string" ? parse(post.content) : null}
            </section>

            {/* Footer actions */}
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Icon icon="mdi:clock-outline" className="h-5 w-5" />
                {updatedAt ? (
                  <time dateTime={post.$updatedAt}>
                    Last updated {updatedAt.toLocaleString()}
                  </time>
                ) : (
                  <span>Fresh post</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share or copy link"
                  className={`${btnBase} ${btnSecondary}`}
                >
                  <Icon icon="mdi:share-variant" className="mr-1.5 h-5 w-5" />
                  Share
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/all-posts")}
                  className={`${btnBase} ${btnPrimary}`}
                >
                  <Icon
                    icon="mdi:format-list-bulleted"
                    className="mr-1.5 h-5 w-5"
                  />
                  All Posts
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Subtle spacer */}
        <div className="h-10" />
      </Container>
    </div>
  );
}
