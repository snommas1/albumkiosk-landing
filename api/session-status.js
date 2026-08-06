import {
    getSessionStatus,
    isValidSessionId,
    jsonResponse,
    normalizeSessionStage,
} from "../lib/session-status.js";

export default {
    async fetch(request) {
        if (request.method !== "GET") {
            return jsonResponse({ error: "Method not allowed" }, 405);
        }

        const parameters = new URL(request.url).searchParams;
        const sessionId = parameters.get("session");
        if (!isValidSessionId(sessionId)) {
            return jsonResponse({ error: "Invalid Session ID" }, 400);
        }

        const stage = normalizeSessionStage(parameters.get("stage"));
        const status = await getSessionStatus(sessionId, stage);
        return jsonResponse({ session: sessionId, stage, status });
    },
};
