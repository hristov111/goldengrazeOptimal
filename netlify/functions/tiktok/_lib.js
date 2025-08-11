const crypto = require("crypto");

function sha256Lower(v) {
  if (!v) return undefined;
  const s = String(v).trim().toLowerCase();
  return crypto.createHash("sha256").update(s, "utf8").digest("hex");
}

function nowSec() { 
  return Math.floor(Date.now() / 1000); 
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((acc, kv) => {
    const [k, ...rest] = kv.trim().split("=");
    if (!k) return acc;
    acc[k] = decodeURIComponent((rest.join("=") || "").trim());
    return acc;
  }, {});
}

function clientContext(event, body = {}) {
  const cookies = parseCookies(event.headers?.cookie || "");
  const ip = (event.headers["x-forwarded-for"] || "").split(",")[0].trim()
           || event.headers["x-real-ip"] || "";
  const user_agent = event.headers["user-agent"] || "";
  const ttclid = body.ttclid || event.queryStringParameters?.ttclid || cookies.ttclid;
  const ttp = body.ttp || cookies._ttp;
  const url = body.url || event.headers.referer || process.env.APP_BASE_URL || "https://example.com";
  return { ip, user_agent, ttclid, ttp, url };
}

function buildPayload(
  { event, event_id, url, value, currency, content_id, content_type, content_name },
  userCtx,
  mode = process.env.TIKTOK_PAYLOAD_MODE || "default"
) {
  const baseUser = {
    email: sha256Lower(userCtx.email),
    phone: sha256Lower(userCtx.phone),
    external_id: sha256Lower(userCtx.external_id),
    ip: userCtx.ip,
    user_agent: userCtx.user_agent,
    ttclid: userCtx.ttclid,
    ttp: userCtx.ttp
  };

  if (mode === "nested") {
    return {
      pixel_code: process.env.TIKTOK_PIXEL_CODE,
      event,
      event_time: nowSec(),
      event_id,
      properties: { value, currency, content_id, content_type, content_name, url },
      user: baseUser,
      test_event_code: process.env.TIKTOK_TEST_EVENT_CODE || undefined
    };
  }

  // default: flat keys (aligned with the fields you listed)
  return {
    pixel_code: process.env.TIKTOK_PIXEL_CODE,
    event,
    event_time: nowSec(),
    event_id,
    url,
    value,
    currency,
    content_id,
    content_type,
    content_name,
    ...baseUser,
    test_event_code: process.env.TIKTOK_TEST_EVENT_CODE || undefined
  };
}

async function sendToTikTok(payload) {
  const endpoint = process.env.TIKTOK_ENDPOINT;
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!endpoint || !token) throw new Error("Missing TikTok config (endpoint or access token).");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Access-Token": token },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data.code && data.code !== 0)) {
    const msg = `TikTok API error: ${data.message || res.statusText}`;
    console.error(msg, { status: res.status, data, sent: payload });
    throw new Error(msg);
  }
  return data;
}

function ok(resBody) {
  return { statusCode: 200, headers: require("./_cors").headers, body: JSON.stringify(resBody) };
}

function bad(status, msg) {
  return { statusCode: status, headers: require("./_cors").headers, body: JSON.stringify({ ok:false, error: msg }) };
}

function readBody(event) {
  if (!event.body) return {};
  try { return JSON.parse(event.body); } catch { return {}; }
}

function requireFields(obj, fields=[]) {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === "") {
      const e = new Error(`Missing required field: ${f}`);
      e.status = 400; 
      throw e;
    }
  }
}

module.exports = {
  sha256Lower, nowSec, clientContext, buildPayload, sendToTikTok, ok, bad, readBody, requireFields
};