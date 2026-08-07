import { registerRedemption } from "../lib/redemption.js";
import { isValidSessionId, jsonResponse } from "../lib/session-status.js";

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
        const prize = typeof payload?.prize === "string"
            ? payload.prize.trim()
            : "";
        const expirationDate = typeof payload?.expiration_date === "string"
            ? payload.expiration_date.trim()
            : "";
        if (!isValidSessionId(sessionId)) {
            return jsonResponse({ error: "Invalid Session ID" }, 400);
        }
        if (!prize) {
            return jsonResponse({ error: "Prize is required" }, 400);
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(expirationDate)) {
            return jsonResponse({ error: "Valid expiration date is required" }, 400);
        }

        const record = await registerRedemption(sessionId, prize, expirationDate);
        return jsonResponse(record);
    },
};
