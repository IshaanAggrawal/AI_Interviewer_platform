import dotenv from "dotenv";
dotenv.config();

const config = {
  // ─── Server ───
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8000", 10),

  // ─── Database ───
  databaseUrl: process.env.DATABASE_URL || "",

  // ─── Redis ───
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },

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
