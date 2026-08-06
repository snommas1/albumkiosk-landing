import { getCache } from "@vercel/functions";

const REDEMPTION_TTL_SECONDS = 90 * 24 * 60 * 60;
const cache = getCache({ namespace: "album-kiosk-redemptions" });

function redemptionKey(sessionId) {
    return `redemption:${sessionId}`;
}

export async function getRedemption(sessionId) {
    const record = await cache.get(redemptionKey(sessionId));
    if (!record || typeof record !== "object" || typeof record.prize !== "string") {
        return null;
    }
    return {
        session: sessionId,
        prize: record.prize,
        redeemed: record.redeemed === true,
        redeemed_time: record.redeemed_time ?? null,
    };
}

export async function redeemPrize(sessionId) {
    const record = await getRedemption(sessionId);
    if (!record) {
        return null;
    }
    if (record.redeemed) {
        return record;
    }

    const redeemedRecord = {
        ...record,
        redeemed: true,
        redeemed_time: new Date().toISOString(),
    };
    await cache.set(redemptionKey(sessionId), redeemedRecord, {
        name: `Album Kiosk redemption ${sessionId}`,
        ttl: REDEMPTION_TTL_SECONDS,
    });
    return redeemedRecord;
}
