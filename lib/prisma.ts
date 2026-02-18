// import { PrismaClient } from "@/generated/prisma/client";
// import { withAccelerate } from "@prisma/extension-accelerate";

// // const prisma = new PrismaClient({
// //   // Prisma 7 specific: explicit accelerateUrl property
// //   accelerateUrl: process.env.DATABASE_URL!,
// // }).$extends(withAccelerate());

// const prisma = new PrismaClient({
//   // Prisma 7 specific: explicit accelerateUrl property
//   accelerateUrl: process.env.DATABASE_URL!,
// })

// // const prisma = Oldprisma.$extends(withAccelerate());
// export default prisma;

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // Example for PostgreSQL

const connectionString = process.env.DIRECT_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
