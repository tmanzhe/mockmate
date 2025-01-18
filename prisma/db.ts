import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance
const prisma = new PrismaClient();

// Export the Prisma client
export default prisma;
