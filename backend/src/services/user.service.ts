import { prisma } from "../lib/prisma";

/**
 * Gets the local database user corresponding to a Clerk user ID.
 * If the user doesn't exist in the local database, creates a placeholder record.
 */
export const getOrCreateLocalUser = async (clerkId: string) => {
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email: `${clerkId}@clerk.local`, // Placeholder email
      },
    });
  }

  return user;
};
