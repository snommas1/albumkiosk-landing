import { getCache } from "@vercel/functions";

const SESSION_PATTERN = /^AK-\d{8}-\d{6}$/;
const VALID_STAGES = new Set(["poster", "coupon"]);
const SESSION_TTL_SECONDS = 15 * 60;
const cache = getCache({ namespace: "album-kiosk-session-status" });

export function isValidSessionId(sessionId) {
    return typeof sessionId === "string" && SESSION_PATTERN.test(sessionId);
}

export function normalizeSessionStage(stage) {
    return VALID_STAGES.has(stage) ? stage : "poster";
}

function statusKey(sessionId, stage) {
    return `${sessionId}:${normalizeSessionStage(stage)}`;
}

export async function markSessionOpened(sessionId, stage = "poster") {
    const normalizedStage = normalizeSessionStage(stage);
    await cache.set(statusKey(sessionId, normalizedStage), "OPENED", {
        name: `Album Kiosk ${sessionId} ${normalizedStage}`,
        ttl: SESSION_TTL_SECONDS,
    });
}

export async function getSessionStatus(sessionId, stage = "poster") {
    const status = await cache.get(statusKey(sessionId, stage));
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
