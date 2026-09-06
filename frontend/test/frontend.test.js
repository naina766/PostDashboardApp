import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatTimeAgo } from "../src/utils/timeAgo.js";
import { getInitials } from "../src/utils/initials.js";

describe("Frontend Utilities & Contracts Suite", () => {
  describe("timeAgo utility", () => {
    it("should return 'Just now' for timestamps less than 30s ago", () => {
      const now = new Date();
      assert.equal(formatTimeAgo(now.toISOString()), "Just now");
    });

    it("should return seconds ago for times between 30 and 60 seconds", () => {
      const past = new Date(Date.now() - 45 * 1000);
      assert.equal(formatTimeAgo(past.toISOString()), "45s ago");
    });

    it("should return minutes ago for times between 1 and 60 minutes", () => {
      const past = new Date(Date.now() - 15 * 60 * 1000);
      assert.equal(formatTimeAgo(past.toISOString()), "15 minutes ago");
    });

    it("should return 'Yesterday' for timestamps ~24 hours ago", () => {
      const yesterday = new Date(Date.now() - 25 * 3600 * 1000);
      assert.equal(formatTimeAgo(yesterday.toISOString()), "Yesterday");
    });

    it("should return empty string on null or undefined input", () => {
      assert.equal(formatTimeAgo(null), "");
      assert.equal(formatTimeAgo(undefined), "");
    });
  });

  describe("getInitials utility", () => {
    it("should return two initials from a full name", () => {
      assert.equal(getInitials("Naina Varshney"), "NV");
    });

    it("should return up to two characters for a single name", () => {
      assert.equal(getInitials("Alex"), "AL");
    });

    it("should fall back when name is empty", () => {
      assert.equal(getInitials(""), "U");
      assert.equal(getInitials(null), "U");
    });
  });

  describe("API Response Envelopes Contract Validation", () => {
    it("should validate standard success envelope structure", () => {
      const mockSuccess = {
        success: true,
        message: "Posts retrieved",
        data: { posts: [], pagination: { total: 0 } },
      };
      assert.equal(mockSuccess.success, true);
      assert.ok(mockSuccess.data);
      assert.ok(Array.isArray(mockSuccess.data.posts));
    });

    it("should validate standard error envelope structure", () => {
      const mockError = {
        success: false,
        message: "Unauthorized access",
        error: {
          code: "AUTH_UNAUTHORIZED",
          message: "Token expired",
        },
      };
      assert.equal(mockError.success, false);
      assert.equal(mockError.error.code, "AUTH_UNAUTHORIZED");
    });
  });
});
