// publicApiAuth.ts

import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
import env from "../env";

function parseKeys(csv: string | undefined): string[] {
  return (csv ?? "").split(",").map(s => s.trim()).filter(Boolean);
}

const PUBLIC_KEYS = parseKeys(env.PUBLIC_API_KEYS);
const ADMIN_KEYS  = parseKeys(env.PUBLIC_API_ADMIN_KEYS);

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function isAllowedKey(key: string) {
  return PUBLIC_KEYS.some(k => safeEqual(k, key)) || ADMIN_KEYS.some(k => safeEqual(k, key));
}
function isAdminKey(key: string) {
  return ADMIN_KEYS.some(k => safeEqual(k, key));
}

export async function publicApiAuth(req: FastifyRequest, reply: FastifyReply) {
  const key = req.headers["x-api-key"];
  if (typeof key !== "string" || !key) {
    reply.status(401).send({ message: "Missing X-API-Key" });
    return;
  }
  if (!isAllowedKey(key)) {
    reply.status(401).send({ message: "Invalid API key" });
    return;
  }

  (req as any).publicApiKey = key;
  (req as any).publicApiIsAdmin = isAdminKey(key);
}

export async function publicApiAdminOnly(req: FastifyRequest, reply: FastifyReply) {
  if (!(req as any).publicApiIsAdmin) {
    reply.status(403).send({ message: "Admin API key required" });
    return;
  }
}
