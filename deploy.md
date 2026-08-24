# Deploy Agentflow_AI

This project deploys as two services:

- Backend: Express/Node.js on Render
- Frontend: Next.js on Vercel
- Database: MongoDB Atlas

## 1. Prepare and push to GitHub

From the project root:

```powershell
git init
git add .
git status
git commit -m "Prepare project for deployment"
```

Create an empty repository on GitHub, then connect and push it:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Before pushing, confirm that `server/.env` and `client/.env.local` do not appear in `git status`. They are excluded by `.gitignore`.

## 2. Deploy the backend to Render

1. Open [Render](https://render.com) and choose **New > Web Service**.
2. Connect the GitHub repository.
3. Use these settings:

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Health Check Path | `/api/health` |

4. Add these environment variables in Render. Do not commit them to GitHub:

```env
NODE_ENV=production
CLIENT_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/agentflow?retryWrites=true&w=majority
JWT_SECRET=generate-a-long-random-secret
CREDENTIAL_ENCRYPTION_KEY=64-hex-character-secret
DNS_SERVERS=8.8.8.8,1.1.1.1
REDIS_URL=
OPENROUTER_API_KEY=
GEMINI_API_KEY=
```

`PORT` does not need to be added. Render supplies it automatically.

If your MongoDB password contains special characters, URL-encode them. For example, `@` becomes `%40` and `#` becomes `%23`.

Generate a credential encryption key with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

After deployment, copy the Render service URL, for example:

```text
https://agentflow-api.onrender.com
```

Check the backend:

```text
https://agentflow-api.onrender.com/api/health
```

The response should contain `\"status\":\"healthy\"`.

## 3. Deploy the frontend to Vercel

1. Open [Vercel](https://vercel.com) and choose **Add New > Project**.
2. Import the same GitHub repository.
3. Set **Root Directory** to `client`.
4. Vercel should detect Next.js automatically. Use:

| Setting | Value |
| --- | --- |
| Framework Preset | `Next.js` |
| Build Command | `npm run build` |
| Output Directory | Leave the default |
| Install Command | `npm install` |

5. Add these environment variables in Vercel for **Production**, **Preview**, and **Development** as needed:

```env
NEXT_PUBLIC_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://YOUR-RENDER-SERVICE.onrender.com
NEXT_PUBLIC_INSTITUTE_NAME=NIT CALICUT
NEXT_PUBLIC_APP_NAME=Agentflow_AI
```

6. Deploy the project and copy the Vercel domain.
7. Return to Render and update `CLIENT_URL` to the exact Vercel URL, then redeploy the backend.

## 4. MongoDB Atlas checklist

In MongoDB Atlas:

1. Add the Render outbound IP addresses to **Network Access**. For initial testing, `0.0.0.0/0` works, but a restricted allowlist is preferred for production.
2. In **Database Access**, verify the database username and password.
3. Grant the application database user read/write access to the application database.
4. Keep the MongoDB URI only in Render environment variables.

The application creates the demo operator and starter workflows automatically when the database is empty.

## 5. Final verification

Open the deployed Vercel site and use the demo login:

```text
Email: operator@nitc.ac.in
Password: Password123!
```

Verify:

- Login works.
- Dashboard data loads.
- Workflows can be listed and opened.
- The backend health endpoint returns a healthy response.
- Live execution updates connect through Socket.IO.

## Troubleshooting

### CORS errors

Set Render's `CLIENT_URL` to the exact Vercel URL, including `https://` and without a trailing slash. Redeploy the backend after changing it.

### API calls still use localhost

Check Vercel's `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL`, then redeploy. `NEXT_PUBLIC_*` values are embedded during the frontend build.

### MongoDB authentication failed

Reset the Atlas database user password and update `MONGODB_URI` in Render. URL-encode special password characters.

### Render service sleeps or is slow initially

Free Render services may sleep when idle. The first request after inactivity can take longer.
