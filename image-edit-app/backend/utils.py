import base64
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI()


def edit_image_based_on_prompt(original_image: Path, prompt: str) -> bytes:
    """
    Edit an image using OpenAI's image editing model and return the edited image bytes.

    Args:
        original_image (Path): Path to the uploaded image to edit.
        prompt (str): Natural language instruction describing the edit.

    Returns:
        bytes: The edited image content.
    """
    with original_image.open("rb") as image_file:
        result = client.images.edit(
            model="gpt-image-1-mini",
            image=[image_file],
            prompt=prompt,
        )

    image_base64 = result.data[0].b64_json
    image_bytes = base64.b64decode(image_base64)
    return image_bytes
