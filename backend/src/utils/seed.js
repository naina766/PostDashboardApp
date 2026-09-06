import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../modules/auth/auth.model.js";
import Post from "../modules/posts/post.model.js";

dotenv.config();

/**
 * Safe Development & Demo Database Seeder
 * STRICT PRODUCTION GUARD: Will immediately abort if run in production.
 */
async function seedDatabase() {
  if (process.env.NODE_ENV === "production") {
    console.error("\n❌ FATAL: Database seeding is disabled in production to protect live data!");
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ MONGO_URI missing in .env file.");
    process.exit(1);
  }

  console.log("🌱 Connecting to MongoDB for development seeding...");
  await mongoose.connect(mongoUri);

  try {
    console.log("🧹 Clearing previous demo data...");
    await User.deleteMany({ email: /@posthub\.demo$/ });
    await Post.deleteMany({ title: /\[Demo\]/ });

    const passwordHash = await bcrypt.hash("Password123!", 10);

    console.log("👤 Creating demo creators...");
    const demoAdmin = await User.create({
      name: "Alex Rivera",
      username: "alex_lead",
      email: "alex@posthub.demo",
      password: passwordHash,
      role: "admin",
      bio: "Full-Stack Architect & Core Contributor to PostHub. Building community platforms.",
      location: "San Francisco, CA",
      website: "https://posthub.dev",
      skills: ["React", "Node.js", "MongoDB", "DevOps"],
      isVerified: true,
      followersCount: 142,
      followingCount: 38,
      postsCount: 2,
    });

    const demoCreator = await User.create({
      name: "Sarah Chen",
      username: "sarah_codes",
      email: "sarah@posthub.demo",
      password: passwordHash,
      role: "user",
      bio: "Frontend engineer & open-source enthusiast. Passionate about UI/UX and a11y.",
      location: "Seattle, WA",
      skills: ["TypeScript", "UI/UX", "CSS", "Vite"],
      isVerified: true,
      followersCount: 89,
      followingCount: 52,
      postsCount: 1,
    });

    console.log("📝 Creating demo community posts...");
    await Post.create([
      {
        user: demoAdmin._id,
        username: demoAdmin.username,
        userAvatar: "",
        title: "[Demo] Welcome to PostHub 4.0",
        content:
          "Welcome to PostHub 4.0! We have completely upgraded the platform architecture with high-density feed streams, dual-token JWT authentication, creator analytics, explainable discovery, and production observability.",
        hashtags: ["posthub", "webdev", "fullstack", "architecture"],
        likesCount: 18,
        commentsCount: 2,
        comments: [
          {
            user: demoCreator._id,
            username: demoCreator.username,
            name: demoCreator.name,
            content: "The new 3-column feed and mobile bottom nav feel incredible! Great work on the design tokens.",
            createdAt: new Date(),
          },
        ],
      },
      {
        user: demoCreator._id,
        username: demoCreator.username,
        userAvatar: "",
        title: "[Demo] Frontend Architecture Discussion",
        content:
          "What is your preferred state management strategy for modern React 19 apps with Vite? Context with fine-grained subscriptions, or atomic stores?",
        hashtags: ["react", "frontend", "javascript"],
        poll: {
          question: "Preferred State Strategy for React 19?",
          options: [
            { text: "React Context + Custom Hooks", votes: [demoAdmin._id] },
            { text: "Zustand / Atomic Stores", votes: [] },
            { text: "Server State (React Query/SWR)", votes: [] },
          ],
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        likesCount: 12,
        commentsCount: 0,
      },
    ]);

    console.log("\n✅ Demo seeding completed successfully!");
    console.log("Demo Credentials for Testing:");
    console.log("  Admin:   alex@posthub.demo   | Password123!");
    console.log("  Creator: sarah@posthub.demo  | Password123!\n");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
