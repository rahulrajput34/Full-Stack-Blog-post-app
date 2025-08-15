// Created the auth for create, login, logout and all from documentation of the Appwrite
import conf from "../conf/conf.js";
import { Client, Account, ID } from "appwrite";

/**
 * @typedef {{ email: string; password: string }} Credentials
 * @typedef {Credentials & { name: string }} SignupInput
 */

export class AuthService {
  client = new Client();
  /** @type {Account} */
  account;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteurl)
      .setProject(conf.appwriteProjectId);
    this.account = new Account(this.client);
  }

  /**
   * Create an account and immediately sign the user in.
   * Returns a session so the return type is consistent.
   * @param {SignupInput} param0
   * @returns {Promise<import("appwrite").Models.Session>}
   */
  async createAccount({ email, password, name }) {
    await this.account.create(ID.unique(), email, password, name);
    return this.account.createEmailPasswordSession(email, password);
  }

  /**
   * Sign in with email + password.
   * @param {Credentials} param0
   * @returns {Promise<import("appwrite").Models.Session>}
   */
  async login({ email, password }) {
    return this.account.createEmailPasswordSession(email, password);
  }

  /**
   * Get the current user; returns null if not logged in or on error.
   * @returns {Promise<import("appwrite").Models.User<any> | null>}
   */
  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error) {
      console.log("Appwrite service :: getCurrentUser :: error", error);
      return null;
    }
  }

  /**
   * Logout all sessions (current user).
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await this.account.deleteSessions();
    } catch (error) {
      console.log("Appwrite service :: logout :: error", error);
    }
  }
}

const authService = new AuthService();
export default authService;
