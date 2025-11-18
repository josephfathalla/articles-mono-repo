import { PrismaClient as PrismaClientRuntime } from "../prisma/generated/client";

//biome-ignore lint/performance/noBarrelFile: No need to export the client
export { PrismaClient } from "../prisma/generated/client";

const prisma = new PrismaClientRuntime();

export default prisma;
