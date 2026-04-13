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

## Build image

```bash
docker build -t ai-studio-app .
```

## Run container

```bash
docker run --rm -p 8787:8787 --env-file .env ai-studio-app
```

## Run with Docker Compose

- `docker-compose.yml` — production (SSL)
- `docker-compose.dev.yml` — without SSL (nginx on port 80 for local testing)

```bash
# dev
docker compose -f docker-compose.dev.yml up --build

# prod
docker compose up --build
```


## Deploy to VPS without cloning repository

If you do **not** want to clone this repo on the server, use prebuilt images in a registry (GHCR/Docker Hub) and keep only runtime files on the VPS.

### 1) Build and push images (CI or local machine)

Build 3 images and push them to your registry:

- `p_zia-app`
- `p_zia-frontend`
- `p_zia-nginx` (built from `Dockerfile.nginx`, includes nginx config)

Example tags:

- `ghcr.io/<org>/p_zia-app:latest`
- `ghcr.io/<org>/p_zia-frontend:latest`
- `ghcr.io/<org>/p_zia-nginx:latest`

### 2) Put only runtime files on VPS

Create a directory on VPS (for example `/opt/p_zia`) and upload:

- `.env`
- `docker-compose.vps.yml`
- `tls/fullchain.pem`
- `tls/privkey.pem`

Optional local folders (for persistent logs):

- `logs/nginx`
- `logs/app`

### 3) Deploy on VPS

```bash
cd /opt/p_zia

docker login ghcr.io

docker compose -f docker-compose.vps.yml pull
docker compose -f docker-compose.vps.yml up -d
```

### 4) Update release

```bash
cd /opt/p_zia
docker compose -f docker-compose.vps.yml pull
docker compose -f docker-compose.vps.yml up -d
```

This way, the VPS never stores project source code — only compose/env/tls and pulled images.
