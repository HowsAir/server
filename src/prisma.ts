/**
 * @file prisma.ts
 * @brief Prisma client for database operations
 * @author Juan Diaz
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
