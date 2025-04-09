import { verify } from "@node-rs/argon2";

export async function verifyPasswordHash(
  passwordHash: string,
  password: string,
) {
  return await verify(passwordHash, password);
}
