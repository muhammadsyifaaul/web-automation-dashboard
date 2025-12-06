import base64
import os
from PIL import Image
import io

def resize_and_encode_screenshot(driver, max_width=720):
    """
    Captures screenshot, resizes it, and returns base64 string.
    """
    png_data = driver.get_screenshot_as_png()
    image = Image.open(io.BytesIO(png_data))
    
    # Resize if needed
    if image.width > max_width:
        ratio = max_width / float(image.width)
        new_height = int((float(image.height) * float(ratio)))
        image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
    
    # Convert back to bytes
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    return img_str
