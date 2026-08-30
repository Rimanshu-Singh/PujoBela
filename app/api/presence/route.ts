import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const PRESENCE_PREFIX = "presence:";
const PRESENCE_TTL_SECONDS = 60;
const SESSION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createResponse(count: number, status = 200) {
  return NextResponse.json(
    { count },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function getRedisClient() {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;

  return new Redis({ url, token });
}

async function countActiveListeners(redis: Redis) {
  let cursor = "0";
  let count = 0;

  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: `${PRESENCE_PREFIX}*`,
      count: 1000,
    });

    cursor = nextCursor;
    count += keys.length;
  } while (cursor !== "0");

  return count;
}

export async function POST(request: Request) {
  let sessionId: string;
  let action: "heartbeat" | "leave";

  try {
    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("action" in body) ||
      (body.action !== "heartbeat" && body.action !== "leave") ||
      !("sessionId" in body) ||
      typeof body.sessionId !== "string" ||
      !SESSION_ID_PATTERN.test(body.sessionId)
    ) {
      return createResponse(1, 400);
    }

    action = body.action;
    sessionId = body.sessionId;
  } catch {
    return createResponse(1, 400);
  }

  const redis = getRedisClient();
  if (!redis) return createResponse(1);

  try {
    const presenceKey = `${PRESENCE_PREFIX}${sessionId}`;

    if (action === "leave") {
      await redis.del(presenceKey);
    } else {
      await redis.set(presenceKey, "1", {
        ex: PRESENCE_TTL_SECONDS,
      });
    }

    const count = await countActiveListeners(redis);
    return createResponse(Math.max(1, count));
  } catch (error) {
    console.error("Presence request failed", error);
    return createResponse(1);
  }
}
