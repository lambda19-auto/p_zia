# Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `OPENAI_API_KEY` in [.env.local](.env.local) (or `.env`) to your OpenAI API key — `npm run api` loads these files automatically
3. Run the API server:
   `npm run api`
4. In another terminal, run the app:
   `npm run dev`

# Docker

## Run with Docker Compose

- `docker-compose.yml` — production (SSL)
- `docker-compose.dev.yml` — without SSL (nginx on port 80 for local testing)


### Run local for development
```bash
# dev
docker compose -f docker-compose.dev.yml up --build

# prod
docker compose up --build
```

### Deploy to VPS

#### 1) Put only runtime files on VPS

Create a directory on VPS (for example `/p_zia`) and upload:

- `.env`
- `docker-compose.yml`
- `tls/fullchain.pem`
- `tls/privkey.pem`

Optional local folders (for persistent logs):

- `logs/nginx`
- `logs/app`

#### 2) Deploy on VPS

```bash
cd p_zia

docker compose -f docker-compose.yml pull
docker compose -f docker-compose.yml up -d
```

#### 3) Update release

```bash
cd p_zia

docker compose -f docker-compose.yml pull
docker compose -f docker-compose.yml up -d
```

This way, the VPS never stores project source code — only compose/env/tls and pulled images.
