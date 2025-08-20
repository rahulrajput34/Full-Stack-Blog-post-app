import conf from "../conf/conf.js";
import { Client, ID, Databases, Storage, Query } from "appwrite";

/**
 * Service
 * -------
 * Thin wrapper around Appwrite Databases & Storage for post and file operations.
 * Initializes a single Appwrite Client, Databases, and Storage instance.
 */
export class Service {
  /** @type {Client} */
  client = new Client();

  /** @type {Databases} */
  databases;

  /** @type {Storage} */
  bucket;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteurl)
      .setProject(conf.appwriteProjectId);

    // Create SDK helpers bound to the client
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  /**
   * Create a new post document using `slug` as the document ID.
   *
   * @param {Object} param0
   * @param {string} param0.title - Post title.
   * @param {string} param0.slug - Stable, unique document ID (used as primary key).
   * @param {string} param0.content - Post body (markdown/HTML/plain).
   * @param {string} param0.featuredImage - File ID or URL for the cover image.
   * @param {"active"|"inactive"|"draft"} param0.status - Publication status.
   * @param {string} param0.userId - Author's user ID.
   * @returns {Promise<import("appwrite").Models.Document>} Created document.
   * @throws {Error} When creation fails (message is normalized).
   */
  async createPost({ title, slug, content, featuredImage, status, userId }) {
    try {
      // Note: `slug` is the explicit document ID here.
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
          userID: userId,
        }
      );
    } catch (error) {
      console.error("Appwrite service :: createPost :: error", error);
      throw new Error("Failed to create post");
    }
  }

  /**
   * Update an existing post document by `slug`.
   *
   * @param {string} slug - Document ID to update.
   * @param {Object} param1
   * @param {string} [param1.title] - New title.
   * @param {string} [param1.content] - New content.
   * @param {string} [param1.featuredImage] - New featured image reference.
   * @param {"active"|"inactive"|"draft"} [param1.status] - New status.
   * @returns {Promise<import("appwrite").Models.Document|void>} Updated document, or undefined on error.
   */
  async updatePost(slug, { title, content, featuredImage, status }) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug,
        {
          title,
          content,
          featuredImage,
          status,
        }
      );
    } catch (error) {
      console.log("Appwrite serive :: updatePost :: error", error);
    }
  }

  /**
   * Delete a post document by `slug`.
   *
   * @param {string} slug - Document ID to delete.
   * @returns {Promise<boolean>} True on success, false on failure.
   */
  async deletePost(slug) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
      return true;
    } catch (error) {
      console.log("Appwrite serive :: deletePost :: error", error);
      return false;
    }
  }

  /**
   * Fetch a single post document by `slug`.
   *
   * @param {string} slug - Document ID to fetch.
   * @returns {Promise<import("appwrite").Models.Document|false>} The document, or false on error.
   */
  async getPost(slug) {
    try {
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        slug
      );
    } catch (error) {
      console.log("Appwrite serive :: getPost :: error", error);
      return false;
    }
  }

  /**
   * List posts with optional query filters.
   * Defaults to only active posts.
   *
   * @param {import("appwrite").Models.Query[]} [queries=[Query.equal("status","active")]]
   * @returns {Promise<import("appwrite").Models.DocumentList<import("appwrite").Models.Document>|false>}
   * Document list on success, false on error.
   */
  // In your Service class
  async getPosts(queries) {
    try {
      const finalQueries =
        Array.isArray(queries) && queries.length > 0
          ? queries
          : [Query.equal("status", "active")];

      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        finalQueries
      );
    } catch (error) {
      console.log("Appwrite service :: getPosts :: error", error);
      return false;
    }
  }

  // ------------------------------
  // File upload / management
  // ------------------------------

  /**
   * Upload a file to the configured storage bucket.
   *
   * @param {File|Blob} file - Browser File/Blob to upload.
   * @returns {Promise<import("appwrite").Models.File|false>} File record on success, false on error.
   */
  async uploadFile(file) {
    try {
      return await this.bucket.createFile(
        conf.appwriteBucketId,
        ID.unique(),
        file
      );
    } catch (error) {
      console.log("Appwrite serive :: uploadFile :: error", error);
      return false;
    }
  }

  /**
   * Delete a file from the storage bucket.
   *
   * @param {string} fileId - ID of the file to delete.
   * @returns {Promise<boolean>} True on success, false on error.
   */
  async deleteFile(fileId) {
    try {
      await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
      return true;
    } catch (error) {
      console.log("Appwrite serive :: deleteFile :: error", error);
      return false;
    }
  }

  /**
   * Get a preview URL for a stored file.
   *
   * @param {string} fileId - ID of the file.
   * @returns {string} Signed preview URL.
   */
  getFilePreview(fileId) {
    // Returns a URL you can use directly in <img src="..."> or fetch.
    return this.bucket.getFilePreview(conf.appwriteBucketId, fileId);
  }
}

const service = new Service();
export default service;
