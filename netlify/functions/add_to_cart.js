const { ok, bad, readBody, clientContext, buildPayload, sendToTikTok, requireFields } = require("./tiktok/_lib");
const { headers, preflight } = require("./tiktok/_cors");
const crypto = require("crypto");

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return preflight();
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method Not Allowed" };

  try {
    const b = readBody(event);
    requireFields(b, ["value", "currency", "content_id", "content_type", "content_name"]);
    const ctx = clientContext(event, b);
    const event_id = b.event_id || crypto.randomUUID();

    const payload = buildPayload(
      { event: "AddToCart", event_id, url: ctx.url, value: Number(b.value), currency: b.currency,
        content_id: b.content_id, content_type: b.content_type, content_name: b.content_name },
      { email: b.email, phone: b.phone, external_id: b.external_id, ...ctx }
    );

    const data = await sendToTikTok(payload);
    return ok({ ok: true, event_id, tiktok: data });
  } catch (e) {
    return bad(e.status || 500, e.message || "Unknown error");
  }
};