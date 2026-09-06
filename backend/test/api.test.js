import { describe, it } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import User from "../src/modules/auth/auth.model.js";
import Post from "../src/modules/posts/post.model.js";
import Follow from "../src/modules/users/follow.model.js";
import Notification from "../src/modules/notifications/notification.model.js";
import Bookmark from "../src/modules/bookmarks/bookmark.model.js";
import Report from "../src/modules/reports/report.model.js";

import * as AuthService from "../src/modules/auth/auth.service.js";
import * as PostService from "../src/modules/posts/post.service.js";
import * as UserService from "../src/modules/users/user.service.js";
import * as ReportService from "../src/modules/reports/report.service.js";
import * as ExploreService from "../src/modules/explore/explore.service.js";
import * as AdminService from "../src/modules/admin/admin.service.js";

describe("1. PostHub 2.0 Database Architecture & Social Collections", () => {
  it("should have all required V2 social models registered", () => {
    const models = Object.keys(mongoose.models);
    assert.strictEqual(models.includes("User"), true, "User model must exist");
    assert.strictEqual(models.includes("Post"), true, "Post model must exist");
    assert.strictEqual(models.includes("Follow"), true, "Follow model must exist");
    assert.strictEqual(models.includes("Notification"), true, "Notification model must exist");
    assert.strictEqual(models.includes("Bookmark"), true, "Bookmark model must exist");
    assert.strictEqual(models.includes("Report"), true, "Report model must exist");
  });

  it("should have rich social fields in Post and User schemas", () => {
    assert.ok(Post.schema.path("hashtags"), "Post schema must have hashtags array");
    assert.ok(Post.schema.path("mentions"), "Post schema must have mentions array");
    assert.ok(Post.schema.path("poll.question"), "Post schema must have poll subdocument");
    assert.ok(Post.schema.path("postType"), "Post schema must have postType enum");
    assert.ok(Post.schema.path("trendingScore"), "Post schema must have trendingScore index");

    assert.ok(User.schema.path("username"), "User schema must have unique username");
    assert.ok(User.schema.path("avatar"), "User schema must have avatar field");
    assert.ok(User.schema.path("role"), "User schema must have role field");
    assert.ok(User.schema.path("followersCount"), "User schema must have followersCount");
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

describe("3. Advanced Post Creation & Validation", () => {
  const dummyUser = {
    _id: new mongoose.Types.ObjectId(),
    name: "Test User",
  };

  it("should reject empty post when text, media, and poll are absent", async () => {
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

  it("should reject poll creation with fewer than 2 options", async () => {
    await assert.rejects(
      async () => {
        await PostService.createPost(
          {
            postType: "POLL",
            poll: { question: "What is your favorite stack?", options: ["Only One Option"] },
          },
          dummyUser
        );
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Polls must contain at least 2 valid options");
        return true;
      }
    );
  });
});

describe("4. Hashtag & Mention Extraction Logic", () => {
  it("should accurately extract normalized hashtags", () => {
    const text = "Exploring #React and #NodeJS with #react and #WebDev!";
    const tags = PostService.extractHashtags(text);
    assert.deepStrictEqual(tags.sort(), ["nodejs", "react", "webdev"].sort());
  });

  it("should accurately extract mentions", () => {
    const text = "Collaborating with @naina and @rahul_sharma on PostHub 2.0";
    const mentions = PostService.extractMentions(text);
    assert.deepStrictEqual(mentions.sort(), ["naina", "rahul_sharma"].sort());
  });
});

describe("5. Deterministic Trending Score Engine", () => {
  it("should calculate deterministic engagement ranking score correctly", () => {
    const mockPost = {
      likesCount: 10,
      commentsCount: 5,
      sharesCount: 2,
      savesCount: 3,
      createdAt: new Date(),
    };

    // formula: 10*1 + 5*3 + 2*4 + 3*3 + ~100 recency = 10 + 15 + 8 + 9 + 100 = 142
    const score = PostService.calculateTrendingScore(mockPost);
    assert.ok(score >= 140 && score <= 145, `Expected score ~142, got ${score}`);
  });
});

describe("6. Comment & Threaded Reply Validation", () => {
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

  it("should reject reply with invalid post or comment ID", async () => {
    await assert.rejects(
      async () => {
        await PostService.addReply("invalid-post-id", "invalid-comment-id", dummyUser, "Nice!");
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Invalid ID provided");
        return true;
      }
    );
  });
});

describe("7. Follow & Social Graph Logic", () => {
  it("should prevent users from following themselves", async () => {
    const selfId = new mongoose.Types.ObjectId();
    await assert.rejects(
      async () => {
        await UserService.followUser(selfId, selfId);
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "You cannot follow yourself");
        return true;
      }
    );
  });

  it("should reject follow operations with invalid target IDs", async () => {
    const selfId = new mongoose.Types.ObjectId();
    await assert.rejects(
      async () => {
        await UserService.followUser(selfId, "not-a-valid-id");
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Invalid user ID");
        return true;
      }
    );
  });
});

describe("8. Content Moderation & Reporting Validation", () => {
  it("should reject reports with invalid reasons", async () => {
    const reporterId = new mongoose.Types.ObjectId();
    const targetId = new mongoose.Types.ObjectId();

    await assert.rejects(
      async () => {
        await ReportService.createReport(reporterId, {
          targetType: "POST",
          targetId,
          reason: "INVALID_REASON",
        });
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Invalid report reason");
        return true;
      }
    );
  });
});

describe("9. Owner & Role Authorization Enforcements", () => {
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

  it("should reject invalid role assignment in admin service", async () => {
    const userId = new mongoose.Types.ObjectId();
    await assert.rejects(
      async () => {
        await AdminService.updateUserRole(userId, "super_god_mode");
      },
      (err) => {
        assert.strictEqual(err.statusCode, 400);
        assert.strictEqual(err.message, "Invalid role");
        return true;
      }
    );
  });
});
