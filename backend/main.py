from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import uuid
import os
from PIL import Image

app = FastAPI()

UPLOAD_DIR = "uploads"
PDF_DIR = "pdf_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)

# API ：上傳圖片
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 允許前端請求
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def root():
    return {"message": "🚀 Backend is alive !!!"}

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
            "topLeft": (40, height - 20),
            "topRight": (width - 140, height - 20),
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
            pdf_urls.append(f"/view-pdf/{file_name}")

        return JSONResponse(content={"pdf_urls": pdf_urls,"code":200})

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/view-pdf/{file_name}")
async def view_pdf(file_name: str):
    file_path = os.path.join(PDF_DIR, file_name)
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found"}, status_code=404)
    return FileResponse(file_path, media_type="application/pdf")
