import { getRedemption, redeemPrize } from "../lib/redemption.js";
import { isValidSessionId, jsonResponse } from "../lib/session-status.js";

export default {
    async fetch(request) {
        const url = new URL(request.url);

        if (request.method === "GET") {
            const sessionId = url.searchParams.get("session");
            if (!isValidSessionId(sessionId)) {
                return jsonResponse({ error: "Invalid Session ID" }, 400);
            }
            const record = await getRedemption(sessionId);
            if (!record) {
                return jsonResponse({ error: "Redemption session not found" }, 404);
            }
            return jsonResponse(record);
        }

        if (request.method === "POST") {
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
            const record = await redeemPrize(sessionId);
            if (!record) {
                return jsonResponse({ error: "Redemption session not found" }, 404);
            }
            return jsonResponse(record);
        }

        return jsonResponse({ error: "Method not allowed" }, 405);
    },
};
