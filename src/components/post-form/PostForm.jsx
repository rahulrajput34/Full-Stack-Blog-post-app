import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Input, RTE, Select } from ".."; 
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      title: post?.title || "",
      slug: post?.$id || "",
      content: post?.content || "",
      status: post?.status || "active",
      image: undefined,
    },
  });

  const [formError, setFormError] = useState("");

  // -------- Slug helpers --------
  const slugTransform = useCallback((value) => {
    if (!value || typeof value !== "string") return "";
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") // non-alnum -> hyphen
      .replace(/^-+|-+$/g, "") // trim hyphens
      .replace(/-{2,}/g, "-"); // collapse
  }, []);

  // Auto-update slug when title changes (only transforms; user can still edit slug manually)
  useEffect(() => {
    const sub = watch((val, { name }) => {
      if (name === "title") {
        const next = slugTransform(val.title);
        setValue("slug", next, { shouldValidate: true });
      }
    });
    return () => sub.unsubscribe();
  }, [watch, slugTransform, setValue]);

  // -------- Image preview --------
  const imageFiles = watch("image"); // FileList from <input type="file" />
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (imageFiles && imageFiles[0]) {
      const url = URL.createObjectURL(imageFiles[0]);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [imageFiles]);

  const statusOptions = useMemo(() => ["active", "inactive"], []);

  // -------- Submit handler --------
  const onSubmit = async (data) => {
    setFormError("");
    try {
      // Basic front-end guards
      if (!data.title?.trim()) {
        setError("title", { type: "required", message: "Title is required" });
        return;
      }
      if (!data.slug?.trim()) {
        setError("slug", { type: "required", message: "Slug is required" });
        return;
      }

      // CREATE
      if (!post) {
        // Image is required for create
        const fileInput = data.image?.[0];
        if (!fileInput) {
          setError("image", {
            type: "required",
            message: "Please select a featured image",
          });
          return;
        }

        // Upload image
        const file = await appwriteService.uploadFile(fileInput);
        if (!file?.$id) throw new Error("Image upload failed.");

        // Persist post (slug is the document ID in your service)
        const dbPost = await appwriteService.createPost({
          title: data.title.trim(),
          slug: data.slug.trim(),
          content: data.content || "",
          featuredImage: file.$id,
          status: data.status,
          userId: userData?.$id,
        });

        if (dbPost?.$id) {
          navigate(`/post/${dbPost.$id}`);
        } else {
          throw new Error("Failed to create post.");
        }
        return;
      }

      // UPDATE
      // If a new image is selected, upload it first
      let newImageId;
      if (data.image?.[0]) {
        const uploaded = await appwriteService.uploadFile(data.image[0]);
        if (!uploaded?.$id) throw new Error("Image upload failed.");
        newImageId = uploaded.$id;

        // Try to delete the old image (do not block update if deletion fails)
        if (post.featuredImage) {
          try {
            await appwriteService.deleteFile(post.featuredImage);
          } catch (_) {
            // non-fatal; continue
          }
        }
      }

      // Update document (document ID remains the same: post.$id)
      const dbPost = await appwriteService.updatePost(post.$id, {
        title: data.title.trim(),
        content: data.content || "",
        status: data.status,
        // Only send featuredImage if a new one was uploaded — otherwise leave unchanged
        ...(newImageId ? { featuredImage: newImageId } : {}),
      });

      if (dbPost?.$id) {
        navigate(`/post/${dbPost.$id}`);
      } else {
        throw new Error("Failed to update post.");
      }
    } catch (err) {
      setFormError(
        err?.message || "Something went wrong while saving your post."
      );
    }
  };

  // ---- Plain button styles ----
  const btnBase =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnPrimary = "bg-indigo-600 text-white hover:bg-indigo-700";
  const btnSecondary =
    "bg-white text-slate-800 border border-slate-200 hover:bg-slate-100";

  // -------- UI --------
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Banner error */}
      {formError && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
        >
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Title/Slug/Editor */}
        <div className="space-y-4 lg:col-span-2">
          <Input
            label="Title"
            placeholder="Post title"
            autoComplete="off"
            aria-invalid={errors.title ? "true" : "false"}
            aria-describedby={errors.title ? "title-error" : undefined}
            disabled={isSubmitting}
            className="mb-1"
            {...register("title", {
              required: "Title is required",
              onChange: () => clearErrors("title"),
            })}
          />
          {errors.title && (
            <p id="title-error" className="text-xs text-red-600">
              {errors.title.message}
            </p>
          )}

          <Input
            label="Slug"
            placeholder="post-title-as-slug"
            autoComplete="off"
            aria-invalid={errors.slug ? "true" : "false"}
            aria-describedby={errors.slug ? "slug-error" : undefined}
            disabled={isSubmitting}
            {...register("slug", {
              required: "Slug is required",
              validate: (v) =>
                slugTransform(v) === v ||
                "Slug may only contain lowercase letters, numbers and hyphens",
              onChange: (e) => {
                const transformed = slugTransform(e.target.value);
                if (transformed !== e.target.value) {
                  setValue("slug", transformed, { shouldValidate: true });
                }
                clearErrors("slug");
              },
            })}
          />
          {errors.slug && (
            <p id="slug-error" className="text-xs text-red-600">
              {errors.slug.message}
            </p>
          )}

          <RTE
            label="Content"
            name="content"
            control={control}
            defaultValue={getValues("content")}
          />
        </div>

        {/* Right: Image, Status, Submit */}
        <div className="space-y-4">
          <Input
            label="Featured Image"
            type="file"
            accept="image/png, image/jpg, image/jpeg, image/gif, image/webp"
            disabled={isSubmitting}
            aria-invalid={errors.image ? "true" : "false"}
            aria-describedby={errors.image ? "image-error" : undefined}
            {...register("image", {
              required: !post ? "Featured image is required" : false,
              validate: (files) => {
                const f = files?.[0];
                if (!f) return true;
                const isOkType = /^image\/(png|jpe?g|gif|webp)$/.test(f.type);
                if (!isOkType) return "Unsupported file type";
                const maxMb = 5;
                if (f.size > maxMb * 1024 * 1024)
                  return `Image must be ≤ ${maxMb}MB`;
                return true;
              },
            })}
          />
          {errors.image && (
            <p id="image-error" className="text-xs text-red-600">
              {errors.image.message}
            </p>
          )}

          {/* Preview: new image takes precedence; otherwise show existing */}
          {(previewUrl || post?.featuredImage) && (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <img
                src={
                  previewUrl ||
                  appwriteService.getFilePreview(post.featuredImage)
                }
                alt={
                  post?.title
                    ? `Featured image for ${post.title}`
                    : "Featured image preview"
                }
                className="aspect-video w-full object-cover"
              />
            </div>
          )}

          <Select
            label="Status"
            options={statusOptions}
            disabled={isSubmitting}
            aria-invalid={errors.status ? "true" : "false"}
            aria-describedby={errors.status ? "status-error" : undefined}
            {...register("status", { required: "Status is required" })}
          />
          {errors.status && (
            <p id="status-error" className="text-xs text-red-600">
              {errors.status.message}
            </p>
          )}

          <div className="flex gap-3">
            {/* Submit (plain button) */}
            <button
              type="submit"
              className={`${btnBase} ${btnPrimary} flex-1`}
              disabled={isSubmitting}
              aria-busy={isSubmitting ? "true" : "false"}
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  {post ? "Updating…" : "Submitting…"}
                </span>
              ) : post ? (
                "Update"
              ) : (
                "Submit"
              )}
            </button>

            {/* Cancel (plain button) */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`${btnBase} ${btnSecondary} flex-1`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
