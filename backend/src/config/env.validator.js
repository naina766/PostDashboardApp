/**
 * Centralized Environment Configuration Validator for PostHub Backend
 * Ensures all required environment variables are present before server bootup.
 */

export function validateEnvironment() {
  const isProduction = process.env.NODE_ENV === "production";
  const errors = [];
  const warnings = [];

  // 1. Database Configuration Check
  if (!process.env.MONGO_URI) {
    errors.push("DATABASE: 'MONGO_URI' is required to connect to MongoDB.");
  }

  // 2. Authentication Secret Check
  if (!process.env.JWT_SECRET) {
    errors.push("AUTH: 'JWT_SECRET' is required to sign access and session tokens.");
  } else if (isProduction && process.env.JWT_SECRET.length < 32) {
    warnings.push("AUTH: 'JWT_SECRET' should be at least 32 characters long in production.");
  }

  // 3. CORS & Allowed Origin Check
  if (isProduction && !process.env.FRONTEND_URL) {
    warnings.push("CORS: 'FRONTEND_URL' not specified in production. Defaulting to strict local origin rejection.");
  }

  // 4. Cloudinary Media Storage Check
  const hasCloudinary =
    Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
    Boolean(process.env.CLOUDINARY_API_KEY) &&
    Boolean(process.env.CLOUDINARY_API_SECRET);

  if (!hasCloudinary) {
    warnings.push(
      "CLOUDINARY: Cloudinary credentials not fully configured. Cloud image uploads may be unavailable."
    );
  }

  // If any fatal configuration errors exist, abort startup
  if (errors.length > 0) {
    console.error("\n=======================================================");
    console.error("❌ CRITICAL CONFIGURATION ERROR: SERVER STARTUP ABORTED");
    console.error("=======================================================");
    errors.forEach((err, idx) => {
      console.error(`  ${idx + 1}. ${err}`);
    });
    console.error("\nPlease configure the above variables in your environment or .env file.");
    console.error("Refer to 'backend/.env.example' for documentation.\n");
    process.exit(1);
  }

  if (warnings.length > 0 && !isProduction) {
    console.warn("\n⚠️  Environment Warnings:");
    warnings.forEach((warn) => console.warn(`  - ${warn}`));
    console.warn("");
  }

  return { valid: true, warnings };
}

export default validateEnvironment;
