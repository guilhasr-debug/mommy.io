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
    const form = await req.formData();
    const pin = String(form.get("pin") || "");
    const expectedHash = Deno.env.get("UPLOAD_PIN_SHA256") || "";

    if (!expectedHash || await sha256(pin) !== expectedHash) {
      return Response.json({ error: "Incorrect upload PIN." }, { status: 401, headers: corsHeaders });
    }

    const name = String(form.get("name") || "").trim();
    const message = String(form.get("message") || "").trim();
    const photo = form.get("photo");

    if (!name || name.length > 60 || message.length > 800) {
      return Response.json({ error: "Please check the name and message length." }, { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let photoUrl = "";
    let storagePath = "";

    if (photo instanceof File && photo.size > 0) {
      if (photo.size > 5 * 1024 * 1024 || !photo.type.startsWith("image/")) {
        return Response.json({ error: "Please upload an image smaller than 5 MB." }, { status: 400, headers: corsHeaders });
      }

      const extension = photo.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
      storagePath = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("memory-photos")
        .upload(storagePath, photo, { contentType: photo.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("memory-photos").getPublicUrl(storagePath);
      photoUrl = data.publicUrl;
    }

    const { error: insertError } = await supabase.from("memories").insert({
      name,
      message,
      photo_url: photoUrl || null,
      storage_path: storagePath || null,
      approved: true
    });

    if (insertError) throw insertError;

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "The memory could not be saved." }, { status: 500, headers: corsHeaders });
  }
});
