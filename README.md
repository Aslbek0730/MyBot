# MyBot Mini App

AI-powered Telegram Mini App + Bot backend for generating text content and publishing to channels.

## Structure

- `backend/` Node.js + Express API
- `frontend/` React (Vite) Telegram Mini App

## Local setup

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Required env vars:

- `TELEGRAM_BOT_TOKEN`
- `SUPER_ADMIN_TELEGRAM_ID`
- `MONGO_URI`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Optionally set:

```bash
VITE_API_URL=http://localhost:4000/api
```

## Vercel deploy (frontend)

This repo includes a `vercel.json` so Vercel can build the `frontend/` app in a monorepo.

1) Import the repo into Vercel.
2) Set environment variable `VITE_API_URL` to your deployed API base (e.g. `https://your-api.example.com/api`).
3) Deploy. Vercel will run:
   - `npm install --prefix frontend`
   - `npm run build --prefix frontend`

## API summary

- `POST /api/auth/telegram`
- `POST /api/generate/text`
- `POST /api/channels/connect`
- `GET /api/channels`
- `POST /api/publish`
- `GET /api/posts`
- `GET /api/stats`

## Notes

- The bot must be an admin in the target channel.
- Only the super admin can publish posts.
- No media is stored; only metadata is saved in MongoDB.
