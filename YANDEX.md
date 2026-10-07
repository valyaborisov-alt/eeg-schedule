# Yandex Cloud production

Primary Russian-hosted deployment of EEG Schedule.

## Resources

- Cloud Function: `eeg-schedule-api`
- Function ID: `d4etbpt51h3f27skuc9o`
- Object Storage bucket: `eeg-schedule-web`
- API Gateway: `eeg-schedule`
- Service URL: `https://d5d5eedg829mo0b2umh8.g2n58e0c.apigw.yandexcloud.net`

Vercel remains available as a fallback.

## Function

Runtime: Node.js 22  
Entrypoint: `index.handler`

Environment variables (values must stay in Yandex Cloud, never Git):

- `GOOGLE_CLIENT_SECRET`
- `COOKIE_SECRET`
- `ALLOWED_USERS`
- `PUBLIC_BASE_URL=https://d5d5eedg829mo0b2umh8.g2n58e0c.apigw.yandexcloud.net`

## Frontend

The contents of `public/` are uploaded to the root of bucket `eeg-schedule-web`.

The bucket is public for object reads only. API Gateway serves static objects and Cloud Function API routes from one origin so OAuth cookies remain same-origin.

## Google OAuth callback

`https://d5d5eedg829mo0b2umh8.g2n58e0c.apigw.yandexcloud.net/api/google/callback`

Keep the Vercel callback registered as a fallback.

## Release rule

Every frontend release must update the Object Storage files as well as GitHub/Vercel. The cache-busting version in `public/index.html` must change when JS/CSS changes.
