import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: corsHeaders });
  }

  try {
    const { title, content, unlock_date, pin } = await req.json();
    const expectedHash = Deno.env.get("UPLOAD_PIN_SHA256") || "";

    if (!expectedHash || await sha256(String(pin || "")) !== expectedHash) {
      return Response.json({ error: "Incorrect upload PIN." }, { status: 401, headers: corsHeaders });
    }

    if (!title || !content || !unlock_date) {
      return Response.json({ error: "Title, letter and opening date are required." }, { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: saveError } = await supabase.from("letters").upsert({
      title: String(title).trim(),
      content: String(content).trim(),
      unlock_date,
      updated_at: new Date().toISOString()
    }, { onConflict: "unlock_date" });

    if (saveError) throw saveError;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const desreEmail = Deno.env.get("DESRE_EMAIL");
    const fromEmail = Deno.env.get("FROM_EMAIL");

    if (!resendKey || !desreEmail || !fromEmail) {
      return Response.json({
        ok: true,
        warning: "Letter saved, but email secrets are not configured."
      }, { headers: corsHeaders });
    }

    const openingDate = new Date(unlock_date).toLocaleDateString("en-ZA", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Johannesburg"
    });

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [desreEmail],
        subject: "A new letter has been added to your birthday vault 💌",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:30px;color:#403536">
            <h1 style="color:#7d3f50">A new letter is waiting for you</h1>
            <p>Dear Desre,</p>
            <p>Claudia has added another special letter to your Monthly Letter Vault.</p>
            <p><strong>It will open on ${openingDate}.</strong></p>
            <p>Every month, something new. Every letter, another reason to remind you how precious you are.</p>
            <p>With love,<br>Claudia</p>
          </div>`
      })
    });

    if (!emailResponse.ok) {
      const detail = await emailResponse.text();
      console.error("Resend error:", detail);
      return Response.json({
        ok: true,
        warning: "Letter saved, but the email could not be sent."
      }, { headers: corsHeaders });
    }

    return Response.json({ ok: true, emailed: true }, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "The letter could not be saved." }, { status: 500, headers: corsHeaders });
  }
});
