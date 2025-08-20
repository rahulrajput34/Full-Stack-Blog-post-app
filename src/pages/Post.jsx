import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import parse from "html-react-parser";
import { Icon } from "@iconify/react";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";

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

  useEffect(() => {
    if (!slug) return navigate("/");
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError("");
        const doc = await appwriteService.getPost(slug);
        if (alive) {
          if (doc) setPost(doc);
          else navigate("/");
        }
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
    if (!post?.featuredImage || typeof appwriteService.getFileView !== "function") return null;
    try {
      const url = appwriteService.getFileView(post.featuredImage);
      return typeof url === "string" ? url : url?.toString();
    } catch {
      return null;
    }
  }, [post?.featuredImage]);

  const imgSrc = !imgDead ? (!useFallback ? previewUrl : viewUrl) : null;

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
    const text = post.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text ? text.split(" ").length : 0;
    return Math.max(1, Math.round(words / 200));
  }, [post?.content]);

  const handleDelete = async () => {
    if (!post) return;
    if (!window.confirm("Delete this post?")) return;
    const status = await appwriteService.deletePost(post.$id);
    if (status) {
      if (post.featuredImage) {
        try {
          await appwriteService.deleteFile(post.featuredImage);
        } catch {}
      }
      navigate("/");
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

  if (loading) {
    return (
      <div className="py-10">
        <Container>
          <div className="mx-auto max-w-3xl animate-pulse">
            <div className="aspect-video w-full rounded-2xl bg-slate-200" />
            <div className="mt-6 h-7 w-2/3 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-1/2 rounded bg-slate-200" />
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-11/12 rounded bg-slate-200" />
              <div className="h-4 w-5/6 rounded bg-slate-200" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (loadError || !post) {
    return (
      <div className="py-10">
        <Container>
          <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError || "Post not found."}
          </div>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              ← Back
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10">
      <Container>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-1 sm:px-0">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <span className="mr-1.5 hidden sm:inline">Back</span>←
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleShare} aria-label="Share or copy link">
              <Icon icon="mdi:share-variant" className="mr-1.5 h-5 w-5" />
              Share
            </Button>
            {copied && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                Link copied
              </span>
            )}
          </div>
        </div>

        <article className="mx-auto mt-4 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={post.title || "Cover image"}
                className="aspect-video w-full object-cover"
                onError={() => {
                  if (!useFallback && viewUrl) setUseFallback(true);
                  else setImgDead(true);
                }}
              />
            ) : (
              <div className="aspect-video flex w-full items-center justify-center bg-slate-100 text-slate-500">
                <Icon icon="mdi:image-off-outline" className="mr-2 h-6 w-6" />
                <span>Image unavailable</span>
              </div>
            )}

            {isAuthor && (
              <div className="absolute right-4 top-4 flex gap-2">
                <Link to={`/edit-post/${post.$id}`}>
                  <Button variant="secondary" className="bg-white/90 backdrop-blur">
                    <Icon icon="mdi:pencil-outline" className="mr-1.5 h-5 w-5" />
                    Edit
                  </Button>
                </Link>
                <Button variant="destructive" onClick={handleDelete} className="backdrop-blur">
                  <Icon icon="mdi:trash-can-outline" className="mr-1.5 h-5 w-5" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <header className="px-6 pb-2 pt-6 sm:pb-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 ${statusClasses}`}>
                {post.status || "active"}
              </span>
              {updatedAt && (
                <time dateTime={post.$updatedAt} className="text-slate-600">
                  Updated {updatedAt.toLocaleString()}
                </time>
              )}
              <span className="text-slate-500">•</span>
              <span className="text-slate-600">{readingMins} min read</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {post.title}
            </h1>
          </header>

          <section className="prose prose-slate max-w-none px-6 pb-8 pt-4 prose-a:text-indigo-600 hover:prose-a:text-indigo-700">
            {typeof post.content === "string" ? parse(post.content) : null}
          </section>
        </article>
      </Container>
    </div>
  );
}
