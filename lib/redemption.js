import { getCache } from "@vercel/functions";

const REDEMPTION_TTL_SECONDS = 90 * 24 * 60 * 60;
const COUPON_TIME_ZONE = "America/Phoenix";
const cache = getCache({ namespace: "album-kiosk-redemptions" });

function redemptionKey(sessionId) {
    return `redemption:${sessionId}`;
}

function currentCalendarDate() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: COUPON_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());
}

function redemptionStatus(record) {
    if (record.redeemed === true) return "redeemed";
    if (currentCalendarDate() > record.expiration_date) return "expired";
    return "valid";
}

export async function getRedemption(sessionId) {
    const record = await cache.get(redemptionKey(sessionId));
    if (
        !record
        || typeof record !== "object"
        || typeof record.prize !== "string"
        || typeof record.expiration_date !== "string"
    ) {
        return null;
    }
    const normalized = {
        session: sessionId,
        prize: record.prize,
        expiration_date: record.expiration_date,
        redeemed: record.redeemed === true,
        redeemed_time: record.redeemed_time ?? null,
        redemption_date: record.redemption_date ?? null,
        redemption_time: record.redemption_time ?? null,
    };
    return { ...normalized, status: redemptionStatus(normalized) };
}

export async function registerRedemption(sessionId, prize, expirationDate) {
    const existingRecord = await getRedemption(sessionId);
    if (existingRecord) {
        return existingRecord;
    }

    const record = {
        session: sessionId,
        prize,
        expiration_date: expirationDate,
        redeemed: false,
        redeemed_time: null,
        redemption_date: null,
        redemption_time: null,
    };
    await cache.set(redemptionKey(sessionId), record, {
        name: `Album Kiosk redemption ${sessionId}`,
        ttl: REDEMPTION_TTL_SECONDS,
    });
    return record;
}

export async function redeemPrize(sessionId) {
    const record = await getRedemption(sessionId);
    if (!record) {
        return null;
    }
    if (record.redeemed) {
        return record;
    }
    if (record.status === "expired") {
        return record;
    }

    const redeemedAt = new Date();
    const redeemedRecord = {
        ...record,
        redeemed: true,
        redeemed_time: redeemedAt.toISOString(),
        redemption_date: new Intl.DateTimeFormat("en-US", {
            timeZone: COUPON_TIME_ZONE,
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
        }).format(redeemedAt),
        redemption_time: new Intl.DateTimeFormat("en-US", {
            timeZone: COUPON_TIME_ZONE,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(redeemedAt),
        status: "redeemed",
    };
    await cache.set(redemptionKey(sessionId), redeemedRecord, {
        name: `Album Kiosk redemption ${sessionId}`,
        ttl: REDEMPTION_TTL_SECONDS,
    });
    return redeemedRecord;
}
