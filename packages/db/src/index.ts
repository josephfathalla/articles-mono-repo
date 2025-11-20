// import { PrismaClient as PrismaClientRuntime } from "../prisma/generated/client";

// //biome-ignore lint/performance/noBarrelFile: No need to export the client
// export { PrismaClient } from "../prisma/generated/client";

// const prisma = new PrismaClientRuntime();

// export default prisma;

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
