# Gatherly Server
1. Create a MongoDB Atlas cluster and database user. Allow your IP in Network Access.
2. Create a Firebase project. In Project Settings > Service accounts, generate a private key.
3. Copy `.env.example` to `.env`; fill `MONGODB_URI`, `CLIENT_URL`, and `FIREBASE_SERVICE_ACCOUNT` with the full JSON on one line.
4. Run `npm install`, then `npm run dev`.
5. Server runs at `http://localhost:5000`.

Deploy on Render as a Web Service. Build command: `npm install`; Start command: `npm start`. Add all environment variables in Render.
