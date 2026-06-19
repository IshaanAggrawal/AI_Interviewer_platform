import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma Client instance.
 * In development, we attach it to `globalThis` to prevent
 * multiple instances during hot-reloading (tsx watch).
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
