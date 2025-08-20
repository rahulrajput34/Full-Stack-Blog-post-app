import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import appwriteService from "../appwrite/config";

/**
 * PostCard – Instagram-like card that displays Appwrite file images reliably.
 * Tries preview first; if that 401/403/404s, falls back to original view URL.
 */
function PostCard({
  $id,
  title,
  featuredImage,
  authorName = "User",
  authorAvatarUrl,
}) {
  const [imgError, setImgError] = useState(false);
  const [fallbackTried, setFallbackTried] = useState(false);

  const previewUrl = useMemo(() => {
    if (!featuredImage) return null;
    try {
      return appwriteService.getFilePreview(featuredImage);
    } catch {
      return null;
    }
  }, [featuredImage]);

  const viewUrl = useMemo(() => {
    if (!featuredImage) return null;
    try {
      return appwriteService.getFileView(featuredImage);
    } catch {
      return null;
    }
  }, [featuredImage]);

  // Decide which URL to show: preview first, else view
  const imageUrl = !imgError ? previewUrl : !fallbackTried ? viewUrl : null;

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-200">
          {authorAvatarUrl ? (
            <img
              src={authorAvatarUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-600">
              {(authorName?.[0] || title?.[0] || "P").toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {authorName}
          </p>
          <p className="text-xs text-slate-500">Post</p>
        </div>
        <button
          type="button"
          className="ml-auto rounded p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label="More options"
        >
          <Icon icon="mdi:dots-vertical" className="h-5 w-5" />
        </button>
      </div>

      {/* Media */}
      <Link to={`/post/${$id}`} className="block">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || "Post image"}
            className="aspect-[4/5] w-full object-cover"
            loading="lazy"
            onError={() => {
              if (!imgError) {
                // First failure: try view URL
                setImgError(true);
              } else {
                // Second failure (preview + view): stop trying
                setFallbackTried(true);
              }
            }}
          />
        ) : (
          <div className="aspect-[4/5] flex w-full items-center justify-center bg-slate-100 text-slate-500">
            <Icon icon="mdi:image-off-outline" className="h-7 w-7" />
            <span className="ml-2 text-sm">Image unavailable</span>
          </div>
        )}
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between px-1 py-2">
        <div className="flex items-center">
          <button
            type="button"
            className="rounded p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Like"
          >
            <Icon icon="mdi:heart-outline" className="h-6 w-6" />
          </button>
          <Link
            to={`/post/${$id}`}
            className="rounded p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Comment"
          >
            <Icon icon="mdi:comment-outline" className="h-6 w-6" />
          </Link>
          <button
            type="button"
            className="rounded p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Share"
          >
            <Icon icon="mdi:send-outline" className="h-6 w-6" />
          </button>
        </div>
        <button
          type="button"
          className="rounded p-2 text-slate-700 hover:bg-slate-100"
          aria-label="Save"
        >
          <Icon icon="mdi:bookmark-outline" className="h-6 w-6" />
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-4">
        <p className="text-sm">
          <span className="font-semibold text-slate-900">{authorName}</span>{" "}
          <span className="text-slate-700">{title || "Untitled post"}</span>
        </p>
      </div>
    </article>
  );
}

PostCard.propTypes = {
  $id: PropTypes.string.isRequired,
  title: PropTypes.string,
  featuredImage: PropTypes.string, // Appwrite file ID
  authorName: PropTypes.string,
  authorAvatarUrl: PropTypes.string,
};

export default PostCard;
