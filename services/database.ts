export const db: Deno.Kv = await Den.openKv(":memory:");

interface User {
  userId: UUID;
}

export async function getUsers() {
  return await db.get(["users"]);
}

export async function setUser(ipAddr: String) {
  await db.set()
}
