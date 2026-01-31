# Security Guide: Managing API Keys

This project uses the Gemini API, which requires a sensitive API Key (`GEMINI_API_KEY`). To ensure the security of this key and the integrity of the project, please follow these guidelines.

## 🚫 Critical Rule: NEVER Commit Keys
**Never** commit your `.env.local` file or any file containing real API keys to GitHub.
- The `.gitignore` file is already configured to exclude `.env.local` and `.env`.
- If you accidentally commit a key, you must revoke it immediately in the Google AI Studio console.

## 🛠 Local Development
For local development, use a `.env.local` file in the project root. This file is ignored by Git.

1.  Create a file named `.env.local`.
2.  Add your API key:
    ```env
    VITE_GEMINI_API_KEY=AIzaSy...YourKeyHere...
    ```
3.  Restart your development server: `npm run dev`.

## 🚀 Deployment (Vercel)
When deploying to Vercel, do **not** upload your `.env` files. Instead, use Vercel's Environment Variables settings.

1.  Go to your Project Settings on Vercel.
2.  Navigate to **Environment Variables**.
3.  Add a new variable:
    - **Key**: `VITE_GEMINI_API_KEY`
    - **Value**: `AIzaSy...YourKeyHere...`
4.  Save and redeploy.

## ✅ Verification
To verify your project is secure:
- Run `git status` to ensure `.env.local` is not being tracked.
- Run `git ls-files .env.local` (should return nothing).
