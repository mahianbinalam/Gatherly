# Gatherly Client

React frontend for the Gatherly Community Event Management Platform.

## Technologies
- React 18
- Vite
- React Router
- Firebase Authentication
- React Toastify
- Lucide React

## Setup
1. Run `npm install`.
2. Copy `.env.example` to `.env`.
3. Configure Firebase credentials and `VITE_API_URL`.
4. Run `npm run dev`.

## Production Build
Run `npm run build`.

## Development Server
http://localhost:5173

## Environment Variables

Create a `.env` file in the client folder using `.env.example` as a template.

- `VITE_API_URL`: Backend API base URL.
- `VITE_FIREBASE_API_KEY`: Firebase web API key.
- `VITE_FIREBASE_AUTH_DOMAIN`: Firebase authentication domain.
- `VITE_FIREBASE_PROJECT_ID`: Firebase project ID.
- `VITE_FIREBASE_APP_ID`: Firebase application ID.

Never commit private credentials or environment files.
