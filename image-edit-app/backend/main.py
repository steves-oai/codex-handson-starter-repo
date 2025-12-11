from __future__ import annotations

import base64
import secrets
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from .utils import edit_image_based_on_prompt

load_dotenv()

app = FastAPI(title="Warm Edit Studio", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "uploaded_image"
EDITED_DIR = BASE_DIR / "edited_image"

for folder in (UPLOAD_DIR, EDITED_DIR):
    folder.mkdir(parents=True, exist_ok=True)


def validate_prompt(prompt: str) -> str:
    cleaned = prompt.strip()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Please share a short instruction for your edit.")
    return cleaned


def validate_image_file(image: UploadFile) -> UploadFile:
    if not image or not image.filename:
        raise HTTPException(status_code=400, detail="Please add an image to edit.")
    if image.content_type and not image.content_type.startswith("image"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file.")
    return image


@app.post("/api/edit")
async def edit_image(
    prompt: str = Form(..., description="Instruction for the edit"),
    image: UploadFile = File(..., description="Image to edit"),
) -> JSONResponse:
    validate_image_file(image)
    cleaned_prompt = validate_prompt(prompt)

    original_bytes = await image.read()
    if not original_bytes:
        raise HTTPException(status_code=400, detail="We couldn't read that image. Try again with a different file.")

    suffix = Path(image.filename).suffix or ".png"
    upload_name = f"upload_{secrets.token_hex(8)}{suffix}"
    upload_path = UPLOAD_DIR / upload_name
    upload_path.write_bytes(original_bytes)

    try:
        edited_bytes = edit_image_based_on_prompt(upload_path, cleaned_prompt)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail="We had trouble editing your image. Please try again.") from exc

    edited_name = f"edited_{secrets.token_hex(8)}.png"
    edited_path = EDITED_DIR / edited_name
    edited_path.write_bytes(edited_bytes)

    encoded_image = base64.b64encode(edited_bytes).decode("utf-8")
    data_url = f"data:image/png;base64,{encoded_image}"

    return JSONResponse({"image": data_url, "filename": edited_name})


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
