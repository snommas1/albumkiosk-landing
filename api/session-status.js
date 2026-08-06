import {
    getSessionStatus,
    isValidSessionId,
    jsonResponse,
} from "../lib/session-status.js";

export default {
    async fetch(request) {
        if (request.method !== "GET") {
            return jsonResponse({ error: "Method not allowed" }, 405);
        }

        const sessionId = new URL(request.url).searchParams.get("session");
        if (!isValidSessionId(sessionId)) {
            return jsonResponse({ error: "Invalid Session ID" }, 400);
        }

        const status = await getSessionStatus(sessionId);
        return jsonResponse({ session: sessionId, status });
    },
};
