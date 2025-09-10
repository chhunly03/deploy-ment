import fetch from "node-fetch";

export async function POST(req) {
  try {
    const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_TOKEN || !CHAT_ID) {
      return new Response(
        JSON.stringify({ error: "Telegram token or chat ID not set" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Optional: allow custom message from POST body
    const body = await req.json().catch(() => ({}));
    const message = body.message || "✅ Deployment done on Vercel!";

    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;
    const telegramResponse = await fetch(url);
    const data = await telegramResponse.json();

    if (!data.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to send Telegram message", details: data }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ status: "sent", data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
