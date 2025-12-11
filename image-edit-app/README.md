# Calm Image Editor

A gently designed, full-stack image editing experience powered by OpenAI's `gpt-image-1-mini`. Upload a photo, share a short prompt, and preview the edited image with minimal fuss.

## Folder structure
```
image-edit-app/
├── backend/           # FastAPI server and image editing logic
├── frontend/          # React + Vite client
├── uploaded_image/    # Saved uploads
├── edited_image/      # Saved edits
├── .env.example       # Environment variable template
├── .gitignore
└── requirements.txt   # Backend dependencies
```

## Prerequisites
- Python 3.11+
- Node.js 18+
- An OpenAI API key with access to the image editing model

## Setup
1. Copy the environment file and add your key:
   ```bash
   cp .env.example .env
   # set OPENAI_API_KEY in .env
   ```

2. Install backend dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

## Running the app locally
1. Start the backend (from `image-edit-app/`):
   ```bash
   source .venv/bin/activate
   uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
   ```

2. Start the frontend in another terminal (from `image-edit-app/frontend`):
   ```bash
   npm run dev -- --host --port 5173
   ```

3. Open `http://localhost:5173` in your browser. Upload an image, write a prompt, and submit to see the edited result on the right.

## How it works
- Uploaded images are saved to `uploaded_image/`.
- `backend/app.py` exposes `edit_image_based_on_prompt(original_image, prompt)`, which calls the OpenAI API exactly as required and saves edited files to `edited_image/`.
- The React client sends the image + prompt to `/api/edit-image` and displays the returned edited file.

## Testing
- Build the frontend to confirm assets compile:
  ```bash
  cd frontend
  npm run build
  ```

## Assumptions
- The app runs with the backend at `http://localhost:8000` and frontend at `http://localhost:5173`.
- Image editing requires stable internet access and valid OpenAI credentials.

Enjoy a calm, creativity-first editing flow.
