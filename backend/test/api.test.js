import { describe, it } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../src/modules/auth/auth.model.js";
import Post from "../src/modules/posts/post.model.js";
import * as AuthService from "../src/modules/auth/auth.service.js";
import * as PostService from "../src/modules/posts/post.service.js";

describe("1. Database Architecture & Models Verification", () => {
  it("should have exactly two application models: User and Post", () => {
    const models = Object.keys(mongoose.models);
    assert.strictEqual(models.includes("User"), true, "User model must exist");
    assert.strictEqual(models.includes("Post"), true, "Post model must exist");
    assert.strictEqual(models.length, 2, "Only User and Post collections must exist");
  });

  it("should embed likes and comments inside Post schema", () => {
    const schema = Post.schema.paths;
    assert.ok(schema.likes, "Post schema must have embedded likes array");
    assert.ok(schema.comments, "Post schema must have embedded comments array");
    assert.ok(schema.username, "Post schema must store author username");
    assert.ok(schema.user, "Post schema must store author user ObjectId");
  });
});

describe("2. Authentication Validation & Security", () => {
  it("should reject registration when required fields are missing", async () => {
    await assert.rejects(
      async () => {
        await AuthService.registerUser({ name: "", email: "", password: "" });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "All fields required");
        return true;
      }
    );
  });

  it("should reject login when credentials are missing", async () => {
    await assert.rejects(
      async () => {
        await AuthService.loginUser({ email: "", password: "" });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Email & password required");
        return true;
      }
    );
  });
});

describe("3. Post Creation & Validation", () => {
  const dummyUser = {
    _id: new mongoose.Types.ObjectId(),
    name: "Test User",
  };

  it("should reject empty post when neither text nor image is provided", async () => {
    await assert.rejects(
      async () => {
        await PostService.createPost({ title: "Only Title", content: "", image: "" }, dummyUser);
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Post must contain text, an image, or both.");
        return true;
      }
    );
  });

  it("should validate and reject invalid MongoDB ObjectIds", async () => {
    await assert.rejects(
      async () => {
        await PostService.getPostById("invalid-id-123");
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Invalid Post ID");
        return true;
      }
    );
  });
});

describe("4. Comment Validation", () => {
  const dummyUser = {
    _id: new mongoose.Types.ObjectId(),
    name: "Commenter",
  };

  it("should reject empty or whitespace-only comments", async () => {
    await assert.rejects(
      async () => {
        await PostService.addComment(new mongoose.Types.ObjectId(), dummyUser, "    ");
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Comment cannot be empty");
        return true;
      }
    );
  });

  it("should reject comments exceeding 500 characters", async () => {
    const longComment = "a".repeat(501);
    await assert.rejects(
      async () => {
        await PostService.addComment(new mongoose.Types.ObjectId(), dummyUser, longComment);
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Comment cannot exceed 500 characters");
        return true;
      }
    );
  });
});

describe("5. Owner Authorization Enforcements", () => {
  it("should reject update or delete on non-existent or invalid post IDs", async () => {
    const userId = new mongoose.Types.ObjectId();
    await assert.rejects(
      async () => {
        await PostService.updatePost("not-a-valid-id", { content: "test" }, userId);
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Invalid Post ID");
        return true;
      }
    );

    await assert.rejects(
      async () => {
        await PostService.deletePost("not-a-valid-id", userId);
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Invalid Post ID");
        return true;
      }
    );
  });
});
