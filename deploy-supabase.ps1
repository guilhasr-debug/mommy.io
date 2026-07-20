# Run after installing the Supabase CLI and logging in.
supabase link --project-ref fkmssqbzfsqqonoghmmz
supabase functions deploy upload-memory --no-verify-jwt
supabase functions deploy upload-letter --no-verify-jwt

# Add these in Supabase Dashboard > Edge Functions > Secrets:
# UPLOAD_PIN_SHA256 = SHA-256 hash of 2207
# RESEND_API_KEY = your Resend API key
# DESRE_EMAIL = Desre's email address
# FROM_EMAIL = verified sender, e.g. Claudia <letters@yourdomain.co.za>
