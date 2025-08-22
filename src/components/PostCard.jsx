import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import appwriteService from "../appwrite/config";

/**
 * PostCard — Professional blog-style card (vertical)
 *
 * - Top: 16:9 thumbnail
 * - Body: author/meta, title, optional excerpt, CTA
 * - Image: try preview; on error fall back to view; else placeholder
 */
function PostCard({
  $id,
  title,
  featuredImage,
  authorName = "User",
  authorAvatarUrl,
  // Optional blog extras
  excerpt,
  publishedAt, // string | Date
  readTime, // e.g. "4 min read"
  tags = [],
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

  const imageUrl = !imgError ? previewUrl : !fallbackTried ? viewUrl : null;

  const formattedDate = useMemo(() => {
    if (!publishedAt) return null;
    const d =
      typeof publishedAt === "string" ? new Date(publishedAt) : publishedAt;
    return Number.isNaN(d?.getTime?.())
      ? null
      : d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  }, [publishedAt]);

  return (
    <article className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Thumbnail */}
      <Link
        to={`/post/${$id}`}
        aria-label={title ? `Read: ${title}` : "Read post"}
        className="block"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || "Post thumbnail"}
            className="w-full aspect-[16/9] object-cover"
            loading="lazy"
            onError={() => {
              if (!imgError) setImgError(true);
              else setFallbackTried(true);
            }}
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-slate-100">
            <Icon
              icon="mdi:image-off-outline"
              className="h-8 w-8 text-slate-400"
            />
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex h-full flex-col p-5">
        {/* Meta */}
        <div className="mb-3 flex items-center gap-3 text-sm text-slate-600">
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
          <span className="truncate font-medium text-slate-900">
            {authorName}
          </span>
          {(formattedDate || readTime) && (
            <>
              <span className="select-none text-slate-300">•</span>
              {formattedDate && (
                <time
                  dateTime={new Date(publishedAt).toISOString()}
                  className="whitespace-nowrap"
                >
                  {formattedDate}
                </time>
              )}
              {readTime && (
                <>
                  <span className="select-none text-slate-300">•</span>
                  <span className="whitespace-nowrap">{readTime}</span>
                </>
              )}
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-xl font-semibold leading-snug tracking-tight text-slate-900">
          <Link
            to={`/post/${$id}`}
            className="underline-offset-2 outline-none transition hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            {title || "Untitled post"}
          </Link>
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="mb-4 line-clamp-3 text-slate-700">{excerpt}</p>
        )}

        {/* Tags (optional) */}
        {!!tags.length && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto">
          <Link
            to={`/post/${$id}`}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Read article
            <Icon icon="mdi:arrow-right" className="h-4 w-4" />
          </Link>
        </div>
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
  excerpt: PropTypes.string,
  publishedAt: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  readTime: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
};

export default PostCard;
