# Deploying to Vercel with Supabase

The app uses Supabase PostgreSQL for application data and a private Supabase
Storage bucket named `school-media` for student assignment uploads and
attendance photos. The bucket is created on the first media upload; the
server-only service role key is required for that setup and for signed media
URLs.

## Vercel environment variables

Add these variables in the Vercel project settings for Production (and Preview
if needed):

- `DATABASE_URL`: Supabase Transaction pooler URL (port `6543`, with
  `pgbouncer=true`).
- `DIRECT_URL`: Supabase Session pooler URL (port `5432`) for Prisma migrations.
- `JWT_SECRET`: a random secret of at least 32 characters. Generate a different
  value from any secret that has been exposed.
- `SUPABASE_URL`: project URL, such as `https://<project-ref>.supabase.co`.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service role key. Never use a
  `NEXT_PUBLIC_` prefix for this key.
- `NEXT_PUBLIC_SUPABASE_URL`: the same project URL, exposed for signed browser
  uploads.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the project's publishable/anon key for signed
  browser uploads.
- `NEXT_PUBLIC_FIELD_LAT`, `NEXT_PUBLIC_FIELD_LNG`, and
  `NEXT_PUBLIC_FIELD_RADIUS`: the school's attendance geofence coordinates and
  radius.

Do not put passwords or secret keys in `.env.example`, source control, or chat.

## Vercel build

`vercel.json` configures the Vercel build to run `npm run vercel-build`. This
applies pending migrations from `prisma/migrations-postgres` and then builds
Next.js. Data is already in Supabase; the build does not re-import local SQLite
data or run the demo seed.

## Persistent media

Assignment videos/photos are uploaded directly from the browser to the private
`school-media` bucket using short-lived signed upload tokens, avoiding Vercel
function request-size limits. Attendance photos use the same bucket. Teacher
pages receive short-lived signed download URLs. The service role key stays
server-side.
