# Supabase and Email Setup

The website is connected to this Supabase project:

- Project URL: `https://fkmssqbzfsqqonoghmmz.supabase.co`
- Browser key: already included in `script.js`

The browser key is publishable. The secret service-role key must only be stored in Supabase Edge Function secrets.

## 1. Create the tables and storage bucket

Open Supabase Dashboard > SQL Editor.

Run:

`supabase/setup.sql`

This creates:

- `memories` table
- `letters` table
- Permanent `memory-photos` Storage bucket
- Read-only public policies
- Date-based protection so locked letter content cannot be read before its opening date

## 2. Hash the upload PIN

The PIN is **2207**, but the Edge Functions store only its SHA-256 hash.

In PowerShell:

```powershell
$pin = "2207"
$bytes = [Text.Encoding]::UTF8.GetBytes($pin)
$hash = [Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
-join ($hash | ForEach-Object { $_.ToString("x2") })
```

Copy the resulting hash.

## 3. Add Edge Function secrets

In Supabase Dashboard > Edge Functions > Secrets, add:

- `UPLOAD_PIN_SHA256` = the hash generated above
- `RESEND_API_KEY` = your Resend API key
- `DESRE_EMAIL` = Desre's email address
- `FROM_EMAIL` = a verified sender, for example `Claudia <letters@yourdomain.co.za>`

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are normally available automatically inside Supabase Edge Functions.

## 4. Deploy the Edge Functions

Using Supabase CLI from this website folder:

```powershell
supabase login
supabase link --project-ref fkmssqbzfsqqonoghmmz
supabase functions deploy upload-memory --no-verify-jwt
supabase functions deploy upload-letter --no-verify-jwt
```

The functions use their own PIN validation. `--no-verify-jwt` is needed because visitors do not sign in with Supabase Auth.

## 5. Configure email

Create a Resend account, add your domain, verify the DNS records, and create an API key.

The notification email does **not** include the private letter. It only tells Desre that a new sealed letter has been added and when it will open.

## How it works

- A visitor enters PIN `2207` and uploads a memory or photograph.
- The browser sends it to the `upload-memory` Edge Function.
- The function validates the PIN server-side.
- The photograph is stored permanently in Supabase Storage.
- The memory record is stored permanently in the database.
- Claudia can add or update a monthly letter in the private upload panel.
- The letter is stored in Supabase and is unreadable publicly until its opening date.
- Desre receives an email notification when the letter is added.


## Important birthday-letter rule

Create the birthday message in the admin panel with opening date **2026-07-22**.
That record is not shown in the Monthly Letter Vault. It powers the separate
**Open My Birthday Message** card instead.

## Automatic monthly behaviour

Letters are loaded directly from the Supabase `letters` table whenever the site opens.
No GitHub code change is needed when a new letter is added. Locked rows cannot be
read publicly before their `unlock_date` because of the Row Level Security policy.

## Birthday surprise

The full-screen birthday surprise appears only on **22 July 2026** in South African time.
It appears once per browser session and links directly to the unlocked birthday letter.


## Production email values

Use these Supabase Edge Function secrets after verifying the domain in Resend:

- `DESRE_EMAIL` = `desreclaase@gmail.com`
- `FROM_EMAIL` = `Claudia <letters@my-friend-des.co.za>`
- `RESEND_API_KEY` = your Resend API key
- `UPLOAD_PIN_SHA256` = SHA-256 hash of `2207`

The website is ready for `my-friend-des.co.za`.
