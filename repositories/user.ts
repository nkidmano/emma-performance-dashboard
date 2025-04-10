import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const userRepository = {
  getUser: async (options: Prisma.UserFindUniqueArgs) => {
    return prisma.user.findUnique(options);
  },

  createUser: async (options: Prisma.UserCreateArgs) => {
    return prisma.user.create(options);
  },

  createUsers: async (options: Prisma.UserCreateManyAndReturnArgs) => {
    return prisma.user.createManyAndReturn(options);
  },

  deleteAllUsers: async (options?: Prisma.UserDeleteManyArgs) => {
    return prisma.user.deleteMany(options);
  },
};
