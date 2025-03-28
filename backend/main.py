from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from pydantic import BaseModel
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from openai import OpenAI
from backend.s3_uploader import upload_to_epsondest

import uuid
import os
import google.generativeai as genai
from PIL import Image

# 測試chatbot
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI()
UPLOAD_DIR = "uploads"
PDF_DIR = "pdf_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)
# API ：上傳圖片
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5173","https://epson-hey-echo.onrender.com"],  # 允許前端請求。舊的: http://localhost:5173
    allow_origins=["*"],#確定此方法可行
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def root():
    return {"message":"Backend is alive !!!"}

# 測試chatbot: gemini+gpt
@app.post("/multi-dialogue-to-image")
async def generate_prompt(req: Request):
    try:
        data = await req.json()
        messages = data.get("messages", [])

        # Step 1: 整理 message 給 Gemini
        combined_text = ""
        for msg in messages:
            if msg["type"] == "text":
                prefix = "User" if msg["role"] == "user" else "AI"
                combined_text += f"{prefix}: {msg['content']}\n"

        # gemini_response = gemini_model.generate_content(combined_text)
        model = genai.GenerativeModel(model_name="gemini-pro")
        gemini_response = model.generate_content(combined_text)
        idea_description = gemini_response.text.strip()

        # Step 2: 使用 GPT 生成 prompt
        system_msg = """
        你是一位圖像提示詞工程師，根據使用者輸入，請生成英文 prompt，可用於 DALL·E 圖像生成，並盡可能加入下列詞庫中的相關詞彙（不需要全部使用）以提升視覺品質與一致性。請以英文輸出，不要額外解釋：

        【光照效果】
        Soft lighting, Hard lighting, Backlighting, Ambient lighting, Spotlight, Golden hour

        【色彩色調】
        Vibrant, Warm Tones, Cool Tones, High Contrast, Sepia

        【渲染與質感】
        4K Resolution, Octane Render, Blender, HDR, Glossy Finish

        【構圖技巧與視角】
        Rule of Thirds, Close-up, Eye Level, Wide shot, One-point perspective
        """
        gpt_response = client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": idea_description}
            ]
        )
        prompt = gpt_response.choices[0].message.content.strip()

        # Step 3: 使用 DALL·E 生成圖片
        img_response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            size="1024x1024"
        )
        image_url = img_response.data[0].url

        return JSONResponse(content={
            "new_messages": [
                {"role": "assistant", "type": "text", "content": prompt},
                {"role": "assistant", "type": "image", "image_url": image_url}
            ]
        })

    except Exception as e:
        print("[ERROR] generate-image:", e)
        return JSONResponse(content={"error": str(e)}, status_code=500)


# API ：上傳圖片
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in ["png", "jpg", "jpeg"]:
        return JSONResponse(content={"error": "只支援 PNG、JPG、JPEG 格式"}, status_code=400)
    file_name = f"{uuid.uuid4().hex}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    return JSONResponse(
        content={
            "message": "圖片上傳成功",
            "image_url": f"/view-image/{file_name}",
            "filename": file_name,
            "code": 200
            })

@app.get("/view-image/{file_name}")
async def view_image(file_name: str):
    file_path = os.path.join(UPLOAD_DIR, file_name)
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found"}, status_code=404)
    return FileResponse(file_path, media_type="image/jpeg")

# API ：生成五個 PDF，每個應用不同排版方式
@app.post("/generate-multiple-pdfs")
async def generate_multiple_pdfs(
    image_filename: str = Form(...), #檔名成稱
    content: str = Form(...), #文字內容
    font_size: int = Form(18), #字體大小
    code: int = Form(200)
):
    try:
        width, height = A4
        pdf_urls = []
        # 定義五種排版方式的位置
        positions = {
            "topLeft": (40, height - 40),
            "topRight": (width - 140, height - 40),
            "center": (width / 2 - 50, height / 2),
            "bottomLeft": (40, 40),
            "bottomRight": (width - 140, 40)
        }

        image_path = os.path.join(UPLOAD_DIR, image_filename)
        if not os.path.exists(image_path):
            return JSONResponse(content={"error": "圖片檔案不存在"}, status_code=400)
        img = ImageReader(image_path)
        img_width, img_height = Image.open(image_path).size
        scale = max(width / img_width, height / img_height)
        new_width = img_width * scale
        new_height = img_height * scale
        img_x = (width - new_width) / 2
        img_y = (height - new_height) / 2
        # 為每種排版生成獨立的 PDF
        for layout, (x, y) in positions.items():
            file_name = f"{uuid.uuid4().hex}_{layout}.pdf"
            file_path = os.path.join(PDF_DIR, file_name)
            c = canvas.Canvas(file_path, pagesize=A4)
            # 設置背景圖
            c.drawImage(img, img_x, img_y, new_width, new_height, mask="auto")
            # 在不同位置顯示文字
            c.setFont("Helvetica-Bold", font_size)
            c.setFillColorRGB(1, 1, 1)  # 白色文字確保可見
            c.drawString(x, y, content)
            c.save()
            
            s3_url = upload_to_epsondest(file_path, f"pdf/{file_name}")  # 上傳 S3
            pdf_urls.append(s3_url)
            upload_status, upload_response = upload_to_epsondest(file_path, file_name)
            print(f"[INFO] Upload to Epson API: {upload_status} - {upload_response}")

            os.remove(file_path)
        return JSONResponse(content={
            "pdf_urls": pdf_urls,
            "code":200
            })
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/view-pdf/{file_name}")
async def view_pdf(file_name: str):
    file_path = os.path.join(PDF_DIR, file_name)
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found"}, status_code=404)
    return FileResponse(file_path, media_type="application/pdf")