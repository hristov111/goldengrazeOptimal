import crypto from "crypto";

export function hashSha256Lower(input) {
  if (!input) return undefined;
  const v = String(input).trim().toLowerCase();
  return crypto.createHash("sha256").update(v, "utf8").digest("hex");
}

export function nowUnix() {
  return Math.floor(Date.now() / 1000);
}

// tiny cookie parser
function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce((acc, kv) => {
    const [k, ...rest] = kv.trim().split("=");
    if (!k) return acc;
    acc[k] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export function clientInfo(req, body = {}) {
  const cookies = parseCookies(req);
  const ip = (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() || req.ip;
  const user_agent = req.get("user-agent") || "";
  const ttclid = body.ttclid || req.query.ttclid || cookies.ttclid;
  const ttp = body.ttp || cookies._ttp; // TikTok pixel cookie is usually _ttp
  return { ip, user_agent, ttclid, ttp };
}

export function buildEventPayload(
  { event, event_id, url, value, currency, content_id, content_type, content_name },
  { email, phone, external_id },
  { ip, user_agent, ttclid, ttp },
  mode = process.env.TIKTOK_PAYLOAD_MODE || "default"
) {
  const hashed = {
    email: hashSha256Lower(email),
    phone: hashSha256Lower(phone),
    external_id: hashSha256Lower(external_id)
  };

  const base = {
    event,
    event_time: nowUnix(),
    event_id,
    url,
    value,
    currency,
    content_id,
    content_type,
    content_name,
    email: hashed.email,
    phone: hashed.phone,
    external_id: hashed.external_id,
    ip,
    user_agent,
    ttclid,
    ttp
  };

  // Remove undefined values to keep payload clean
  Object.keys(base).forEach(key => {
    if (base[key] === undefined) {
      delete base[key];
    }
  });

  if (mode === "nested") {
    return {
      event,
      event_time: base.event_time,
      event_id,
      properties: {
        value, 
        currency, 
        content_id, 
        content_type, 
        content_name, 
        url
      },
      user: {
        email: hashed.email, 
        phone: hashed.phone, 
        external_id: hashed.external_id,
        ip, 
        user_agent, 
        ttclid, 
        ttp
      }
    };
  }

  return base;
}

export async function sendToTikTok(payload) {
  const endpoint = process.env.TIKTOK_API_ENDPOINT;
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  
  if (!endpoint || !token) {
    throw new Error("TikTok config missing: set TIKTOK_API_ENDPOINT and TIKTOK_ACCESS_TOKEN");
  }

  console.log('📤 Sending to TikTok:', JSON.stringify(payload, null, 2));

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Token": token
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json().catch(() => ({}));
  
  if (!res.ok || data.code) {
    const msg = `TikTok API error: ${data.message || res.statusText}`;
    console.error('❌ TikTok API Error:', {
      status: res.status,
      statusText: res.statusText,
      response: data,
      payload: payload
    });
    throw new Error(msg);
  }

  console.log('✅ TikTok API Success:', data);
  return data;
}