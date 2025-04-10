import { hash } from "@node-rs/argon2";
import { userRepository } from "../repositories/user";

const users = [
  {
    username: "admin",
    password: "randompassword", // enter password here
  },
];

async function seed() {
  console.time("seed-time");

  await userRepository.deleteAllUsers();

  const hashed = await Promise.all(
    users.map(async (user) => ({
      username: user.username,
      passwordHash: await hash(user.password),
    })),
  );

  await userRepository.createUsers({ data: hashed });

  console.timeEnd("seed-time");
}

seed();
