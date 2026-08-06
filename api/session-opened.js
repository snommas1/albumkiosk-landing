import {
    isValidSessionId,
    jsonResponse,
    markSessionOpened,
    normalizeSessionStage,
} from "../lib/session-status.js";

export default {
    async fetch(request) {
        if (request.method !== "POST") {
            return jsonResponse({ error: "Method not allowed" }, 405);
        }

        let payload;
        try {
            payload = await request.json();
        } catch {
            return jsonResponse({ error: "Invalid JSON body" }, 400);
        }

        const sessionId = payload?.session;
        if (!isValidSessionId(sessionId)) {
            return jsonResponse({ error: "Invalid Session ID" }, 400);
        }

        const stage = normalizeSessionStage(payload?.stage);
        await markSessionOpened(sessionId, stage);
        return jsonResponse({ session: sessionId, stage, status: "OPENED" });
    },
};
