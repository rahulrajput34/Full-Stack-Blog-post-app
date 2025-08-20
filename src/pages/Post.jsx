import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import parse from "html-react-parser";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";

export default function Post() {
  const [post, setPost] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);

  const [useFallback, setUseFallback] = useState(false);
  const [imgDead, setImgDead] = useState(false);

  const { slug } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  // NOTE: your document uses `userID` (not `userId`)
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

  const handleDelete = async () => {
    if (!post) return;
    const ok = window.confirm("Delete this post?");
    if (!ok) return;
    const status = await appwriteService.deletePost(post.$id);
    if (status) {
      if (post.featuredImage) {
        try {
          await appwriteService.deleteFile(post.featuredImage);
        } catch {
          /* non-fatal */
        }
      }
      navigate("/");
    }
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
    <div className="py-10">
      <Container>
        <article className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Cover image with edit/delete overlay for author */}
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
                <span>Image unavailable</span>
              </div>
            )}

            {isAuthor && (
              <div className="absolute right-4 top-4 flex gap-2">
                <Link to={`/edit-post/${post.$id}`}>
                  <Button
                    variant="secondary"
                    className="bg-white/90 backdrop-blur"
                  >
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="backdrop-blur"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Title & meta */}
          <header className="px-6 pb-4 pt-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {post.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
                {post.status || "active"}
              </span>
              {post.$updatedAt && (
                <time dateTime={post.$updatedAt}>
                  Updated {new Date(post.$updatedAt).toLocaleString()}
                </time>
              )}
            </div>
          </header>

          {/* Content */}
          <section className="prose prose-slate max-w-none px-6 pb-8">
            {typeof post.content === "string" ? parse(post.content) : null}
          </section>
        </article>

        <div className="mx-auto mt-6 max-w-3xl">
          <Button variant="secondary" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
      </Container>
    </div>
  );
}
