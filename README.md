# Run and deploy your AI Studio app

View your app in AI Studio: https://ai.studio/apps/d4f04ea9-0dc6-479f-91e6-545b46bcf3da

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `OPENAI_API_KEY` in [.env.local](.env.local) (or `.env`) to your OpenAI API key — `npm run api` loads these files automatically
3. Run the API server:
   `npm run api`
4. In another terminal, run the app:
   `npm run dev`
