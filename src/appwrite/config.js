// appwrite/config.js
import conf from "../conf/conf.js";
import {
  Client,
  ID,
  Databases,
  Storage,
  Query,
  Permission,
  Role,
} from "appwrite";

/**
 * Service
 * -------
 * Minimal wrapper around Appwrite Databases & Storage for post CRUD and file operations.
 * Initializes a single Appwrite Client and exposes convenience methods used by the app.
 */
export class Service {
  /** @type {Client} Appwrite SDK client instance (shared). */
  client = new Client();

  /** @type {Databases} Database API helper for CRUD operations. */
  databases;

  /** @type {Storage} Storage API helper for file uploads/reads. */
  bucket;

  /**
   * Bootstraps Appwrite SDK with endpoint & project, then wires Databases/Storage.
   * Keep constructor lean—no network requests here.
   */
  constructor() {
    // Configure SDK target (endpoint + project) from env config.
    this.client
      .setEndpoint(conf.appwriteurl)
      .setProject(conf.appwriteProjectId);

    // Create helpers tied to the configured client.
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  // ------------------------------
  // Posts
  // ------------------------------

  /**
   * Create a new post document using `slug` as the document ID.
   *
   * @param {Object} param0 - Post fields.
   * @param {string} param0.title - Human-readable post title.
   * @param {string} param0.slug - Unique, URL-safe identifier (used as document ID).
   * @param {string} param0.content - Post body (markdown/HTML/plain).
   * @param {string} param0.featuredImage - File ID or URL of the hero image.
   * @param {"active"|"inactive"|"draft"} param0.status - Publish state.
   * @param {string} param0.userId - Creator/owner user ID (stored as `userID` in DB).
   * @returns {Promise<import("appwrite").Models.Document>} Newly created document.
   * @throws {Error} Rethrows a generic error on failure to keep call sites simple.
   */
  async createPost({ title, slug, content, featuredImage, status, userId }) {
    try {
      // Attempt to persist a new document; `slug` is used as the stable ID.
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
          userID: userId, // note: field is userID in DB
        }
      );
    } catch (error) {
      // Log for diagnostics; surface a clean message to callers.
      console.error("Appwrite service :: createPost :: error", error);
      throw new Error("Failed to create post");
    }
  }

  /**
   * Update an existing post document by `slug`.
   *
   * @param {string} slug - Document ID to update (same as post slug).
   * @param {{title?: string, content?: string, featuredImage?: string, status?: "active"|"inactive"|"draft"}} data - Partial update payload.
   * @returns {Promise<import("appwrite").Models.Document|void>} Updated document on success; undefined if an error is caught.
   */
  async updatePost(slug, { title, content, featuredImage, status }) {
    try {
      // Apply a partial update; only provided fields are modified.
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        { title, content, featuredImage, status }
      );
    } catch (error) {
      // Swallowing error after logging keeps UI flow simple; revisit if you need strict error paths.
      console.log("Appwrite service :: updatePost :: error", error);
    }
  }

  /**
   * Delete a post document by `slug`.
   *
   * @param {string} slug - Document ID to delete.
   * @returns {Promise<boolean>} True on success; false if deletion fails.
   */
  async deletePost(slug) {
    try {
      // Remove the document permanently by its ID.
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
      return true;
    } catch (error) {
      // Return a boolean to keep consumers branch-friendly.
      console.log("Appwrite service :: deletePost :: error", error);
      return false;
    }
  }

  /**
   * Fetch a single post document by `slug`.
   *
   * @param {string} slug - Document ID to fetch.
   * @returns {Promise<import("appwrite").Models.Document|false>} Document on success; false if not found or errored.
   */
  async getPost(slug) {
    try {
      // Retrieve and return the document if it exists.
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
    } catch (error) {
      // Use a falsy sentinel so callers can do simple checks.
      console.log("Appwrite service :: getPost :: error", error);
      return false;
    }
  }

  /**
   * List posts with optional query filters (defaults to active posts).
   *
   * @param {any[]} [queries=[Query.equal("status","active")]] - Appwrite query array; pass [] to filter yourself.
   * @returns {Promise<import("appwrite").Models.DocumentList<import("appwrite").Models.Document>|false>} Document list on success; false on error.
   */
  async getPosts(queries) {
    try {
      // Use caller-provided queries, or default to published posts only.
      const finalQueries =
        Array.isArray(queries) && queries.length > 0
          ? queries
          : [Query.equal("status", "active")];

      // Page through results via Appwrite SDK (this call returns the first page).
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        finalQueries
      );
    } catch (error) {
      // Keep API forgiving for list views—UI can handle 'no data' state.
      console.log("Appwrite service :: getPosts :: error", error);
      return false;
    }
  }

  // ------------------------------
  // Files
  // ------------------------------

  /**
   * Upload a file to the storage bucket with PUBLIC read permission.
   * Use for images you want to render directly in <img> for anonymous users.
   *
   * @param {File|Blob} file - Browser File/Blob to upload.
   * @returns {Promise<import("appwrite").Models.File|false>} File record on success; false on error.
   */
  async uploadFilePublic(file) {
    try {
      // Create a file with a unique ID and grant world-readable permission.
      return await this.bucket.createFile(
        conf.appwriteBucketId,
        ID.unique(),
        file,
        [Permission.read(Role.any())] // ⭐ public read
      );
    } catch (error) {
      // Return false so callers can gracefully degrade (e.g., placeholder image).
      console.log("Appwrite service :: uploadFilePublic :: error", error);
      return false;
    }
  }

  /**
   * Back-compat: keep the old name but delegate to public uploader.
   *
   * @param {File|Blob} file - File to upload (public).
   * @returns {Promise<import("appwrite").Models.File|false>} File record on success; false on error.
   */
  async uploadFile(file) {
    // Delegate to the canonical public uploader to avoid duplicate logic.
    return this.uploadFilePublic(file);
  }

  /**
   * Make an existing stored file publicly readable (helpful for legacy uploads).
   * Handles both modern and older SDK `updateFile` signatures.
   *
   * @param {string} fileId - Target file ID in the bucket.
   * @returns {Promise<boolean>} True if permissions updated; false otherwise.
   */
  async makeFilePublic(fileId) {
    try {
      // First attempt: modern signature using an options object.
      try {
        // @ts-ignore - allow runtime attempt across SDK versions.
        await this.bucket.updateFile(conf.appwriteBucketId, fileId, {
          permissions: [Permission.read(Role.any())],
        });
      } catch {
        // Fallback: older signature where permissions are the 4th argument.
        // @ts-ignore - allow runtime attempt across SDK versions.
        await this.bucket.updateFile(conf.appwriteBucketId, fileId, undefined, [
          Permission.read(Role.any()),
        ]);
      }
      // If we reached here without throwing, the file is now public.
      return true;
    } catch (error) {
      // Log and signal failure so callers can retry or show a message.
      console.log("Appwrite service :: makeFilePublic :: error", error);
      return false;
    }
  }

  /**
   * Build a preview URL for an image/file (resized & compressed).
   * Use as `src` for thumbnails or optimized display.
   *
   * @param {string} fileId - Target file ID in the bucket.
   * @param {number} [w=1200] - Requested width in pixels.
   * @param {number} [h=1200] - Requested height in pixels.
   * @param {number} [quality=80] - JPEG quality (1–100).
   * @returns {string} Absolute preview URL.
   */
  getFilePreview(fileId, w = 1200, h = 1200, quality = 80) {
    // Generate a transformation URL; coerce to string for consistent returns.
    const url = this.bucket.getFilePreview(
      conf.appwriteBucketId,
      fileId,
      w,
      h,
      "center",
      quality
    );
    return typeof url === "string" ? url : url?.toString();
  }

  /**
   * Build a direct/original view URL (no transformations).
   * Prefer as a fallback if preview URLs fail or for non-images.
   *
   * @param {string} fileId - Target file ID in the bucket.
   * @returns {string} Absolute file view URL.
   */
  getFileView(fileId) {
    // Return canonical, unmodified file URL.
    const url = this.bucket.getFileView(conf.appwriteBucketId, fileId);
    return typeof url === "string" ? url : url?.toString();
  }

  /**
   * Permanently delete a stored file by ID.
   *
   * @param {string} fileId - Target file ID in the bucket.
   * @returns {Promise<boolean>} True on success; false if deletion fails.
   */
  async deleteFile(fileId) {
    try {
      // Remove the file from storage; irreversible.
      await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
      return true;
    } catch (error) {
      // Return a boolean to make UI flows straightforward.
      console.log("Appwrite service :: deleteFile :: error", error);
      return false;
    }
  }
}

// Instantiate a shared service for app-wide use.
const service = new Service();
export default service;
