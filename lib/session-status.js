import { getCache } from "@vercel/functions";

const SESSION_PATTERN = /^AK-\d{8}-\d{6}$/;
const SESSION_TTL_SECONDS = 15 * 60;
const cache = getCache({ namespace: "album-kiosk-session-status" });

export function isValidSessionId(sessionId) {
    return typeof sessionId === "string" && SESSION_PATTERN.test(sessionId);
}

export async function markSessionOpened(sessionId) {
    await cache.set(sessionId, "OPENED", {
        name: `Album Kiosk ${sessionId}`,
        ttl: SESSION_TTL_SECONDS,
    });
}

export async function getSessionStatus(sessionId) {
    const status = await cache.get(sessionId);
    return status === "OPENED" ? "OPENED" : "WAITING";
}

export function jsonResponse(payload, status = 200) {
    return Response.json(payload, {
        status,
        headers: {
            "Cache-Control": "no-store, max-age=0",
            "Vercel-CDN-Cache-Control": "no-store",
        },
    });
}
