export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    // Admin PIN Verification endpoint: GET /api/data?verify=1
    if (url.searchParams.get("verify") === "1") {
      const adminPin = request.headers.get("X-Admin-Pin");
      const expectedPin = env.ADMIN_PIN || "1234";
      if (!adminPin || adminPin !== expectedPin) {
        return new Response(JSON.stringify({ valid: false, error: "Wrong Admin PIN" }), {
          status: 401,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
        });
      }
      return new Response(JSON.stringify({ valid: true }), {
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    }

    const row = await env.DB.prepare(
      "SELECT payload, updated_at FROM app_state WHERE id = 1"
    ).first();

    if (!row) {
      return new Response(JSON.stringify({ empty: true }), {
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
      });
    }

    return new Response(row.payload, {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const adminPin = request.headers.get("X-Admin-Pin");
    const expectedPin = env.ADMIN_PIN || "1234";

    if (!adminPin || adminPin !== expectedPin) {
      return new Response(JSON.stringify({ error: "Unauthorized: Wrong Admin PIN" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const bodyText = await request.text();
    JSON.parse(bodyText); // Validate JSON before saving

    await env.DB.prepare(
      "INSERT OR REPLACE INTO app_state (id, payload, updated_at) VALUES (1, ?, CURRENT_TIMESTAMP)"
    ).bind(bodyText).run();

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
