import base64
import os
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from openai import OpenAI

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADED_DIR = os.path.join(BASE_DIR, "uploaded_image")
EDITED_DIR = os.path.join(BASE_DIR, "edited_image")

os.makedirs(UPLOADED_DIR, exist_ok=True)
os.makedirs(EDITED_DIR, exist_ok=True)

client = OpenAI()


def edit_image_based_on_prompt(original_image: str, prompt: str) -> str:
    """Edit an image using the OpenAI API and return the saved filename."""
    result = client.images.edit(
        model="gpt-image-1-mini",
        image=[open(original_image, "rb")],
        prompt=prompt,
    )

    image_base64 = result.data[0].b64_json
    image_bytes = base64.b64decode(image_base64)

    edited_filename = f"edited_{uuid4().hex}.png"
    edited_path = os.path.join(EDITED_DIR, edited_filename)

    with open(edited_path, "wb") as f:
        f.write(image_bytes)

    return edited_filename


app = FastAPI(title="Calm Image Editor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.post("/api/edit-image")
async def edit_image(image: UploadFile = File(...), prompt: str = Form(...)):
    if not prompt.strip():
        raise HTTPException(status_code=400, detail="Please share a quick idea for the edit.")

    filename = image.filename or "upload.png"
    safe_filename = f"upload_{uuid4().hex}_{os.path.basename(filename)}"
    uploaded_path = os.path.join(UPLOADED_DIR, safe_filename)

    content = await image.read()
    with open(uploaded_path, "wb") as f:
        f.write(content)

    try:
        edited_filename = edit_image_based_on_prompt(uploaded_path, prompt)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail="The image editor had trouble finishing this request.") from exc

    return {"editedImageUrl": f"/edited_image/{edited_filename}"}


@app.get("/health")
async def healthcheck():
    return {"status": "ok"}


app.mount("/edited_image", StaticFiles(directory=EDITED_DIR), name="edited_image")
