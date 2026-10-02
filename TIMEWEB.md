# Timeweb Cloud deployment

EEG Schedule can run in parallel on Vercel and Timeweb Cloud App Platform.

## App settings

- Runtime: Node.js 20 or newer
- Build command: none (or `npm install`)
- Start command: `npm start`
- Port: use the platform-provided `PORT` variable
- Repository branch: `main`

## Required environment variables

Configure these in the Timeweb application settings. Never commit their values:

- `GOOGLE_CLIENT_SECRET`
- `COOKIE_SECRET`
- `ALLOWED_USERS`

Example ALLOWED_USERS format:

```json
{"admin@example.com":"admin"}
```

## Google OAuth

After Timeweb assigns the application HTTPS hostname, add this Authorized redirect URI to the existing Google OAuth Web Client:

`https://YOUR-TIMEWEB-HOST/api/google/callback`

Keep the existing Vercel redirect URI as well.

If a custom domain is attached later, add its callback too:

`https://YOUR-DOMAIN/api/google/callback`

## Health check

Open:

`https://YOUR-TIMEWEB-HOST/api/calendar/save`

A working deployment returns JSON containing `version` and `testDate`.

## Notes

The same Google Calendars and user roles are used by both deployments. Vercel can remain online as a fallback while Timeweb is tested.
