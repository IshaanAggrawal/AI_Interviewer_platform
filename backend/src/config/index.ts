import dotenv from "dotenv";
dotenv.config();

const config = {
  // ─── Server ───
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8000", 10),

  // ─── Database ───
  databaseUrl: process.env.DATABASE_URL || "",

  // ─── Redis ───
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  // ─── Clerk ───
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY || "",
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || "",
  },

  // ─── Groq ───
  groq: {
    apiKey: process.env.GROQ_API_KEY || "",
  },

  // ─── AWS S3 ───
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    region: process.env.AWS_REGION || "ap-south-1",
    s3Bucket: process.env.AWS_S3_BUCKET || "ai-interviewer-uploads",
  },

  // ─── Deepgram ───
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY || "",
  },
} as const;

export default config;
