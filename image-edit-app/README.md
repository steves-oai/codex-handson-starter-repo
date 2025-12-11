# Warm Edit Studio
A calm, full-stack image editing experience powered by OpenAI. Upload a photo, describe the change in everyday language, and receive a refined image in seconds.

## Folder structure
```
image-edit-app/
├── backend/
├── frontend/
├── uploaded_image/
├── edited_image/
├── README.md
├── .env.example
├── .gitignore
├── example.png
└── requirements.txt
```

## Prerequisites
- Python 3.10+
- Node.js 18+
- An OpenAI API key with access to `gpt-image-1-mini`

## Setup
1. From the repository root, move into the app folder:
   ```bash
   cd image-edit-app
   ```
2. Create your environment file and add your API key:
   ```bash
   cp .env.example .env
   # then set OPENAI_API_KEY
   ```
3. Install backend dependencies in a virtual environment (recommended):
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
4. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Running the app locally
### Backend (FastAPI)
From `image-edit-app/`:
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
- Loads environment variables via `python-dotenv`.
- Saves originals to `uploaded_image/` and edited results to `edited_image/`.

### Frontend (React + Vite)
From `image-edit-app/frontend`:
```bash
npm run dev -- --host --port 5173
```
- The frontend calls `http://localhost:8000/api/edit` by default. Override with `VITE_API_URL` in a `.env` file inside `frontend/` if needed.

Then open http://localhost:5173/ in your browser.

## How to use
1. Drag-and-drop or browse for an image on the left panel.
2. Write a natural-language instruction describing the edit.
3. Click **"Edit my image"** to receive the updated picture on the right.

## Testing
- Frontend build check:
  ```bash
  cd image-edit-app/frontend
  npm run build
  ```

## Assumptions
- The OpenAI key provided has access to the `gpt-image-1-mini` model.
- Image uploads are modest in size (PNG/JPG/HEIC up to ~10MB) and are stored locally only within `uploaded_image/` and `edited_image/`.
- Network access is available for the backend to call OpenAI.
