# Gatherly Server

Express.js backend API for the Gatherly Community Event Management Platform.

## Technologies
- Node.js
- Express.js
- MongoDB Atlas
- Firebase Admin
- CORS
- dotenv

## Setup
1. Run `npm install`.
2. Copy `.env.example` to `.env`.
3. Configure `MONGODB_URI`, `DB_NAME`, `CLIENT_URL`, and `FIREBASE_SERVICE_ACCOUNT`.
4. Run `npm run dev`.

## Production
Run `npm start`.

## API Server
http://localhost:5000

## Deployment
Deploy as a Render Web Service.
Build command: `npm install`
Start command: `npm start`

## Environment Variables

Configure the server `.env` file using `.env.example`.

- `PORT`: Backend server port.
- `CLIENT_URL`: Frontend origin allowed by CORS.
- `MONGODB_URI`: MongoDB Atlas connection string.
- `DB_NAME`: MongoDB database name.
- `FIREBASE_SERVICE_ACCOUNT`: Firebase Admin service account credentials.

Keep `.env` and all private credentials out of Git.
