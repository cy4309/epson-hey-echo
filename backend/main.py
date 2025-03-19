from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel
from zipfile import ZipFile

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import uuid
import os

app = FastAPI()

class LayoutRequest(BaseModel):
    content: str

@app.post("/generate-pdf-zip")
async def generate_pdf_zip(request: LayoutRequest):
    return await generate_pdfs_and_zip(request)

async def generate_pdfs_and_zip(request: LayoutRequest):
    width, height = A4
    filenames = []
    
    # 定義所有的版面位置
    positions = {
        "topLeft": (40, height - 40),
        "topRight": (width - 140, height - 40),
        "center": (width / 2 - 50, height / 2),
        "bottomLeft": (40, 40),
        "bottomRight": (width - 140, 40)
    }

    # 生成五個獨立的 PDF
    for layout, (x, y) in positions.items():
        file_name = f"{uuid.uuid4()}_{layout}.pdf"
        c = canvas.Canvas(file_name, pagesize=A4)
        c.setFont("Helvetica", 12)
        c.drawString(x, y, request.content)
        c.save()
        filenames.append(file_name)

    # 創建 ZIP 檔案
    zip_filename = f"{uuid.uuid4()}_pdfs.zip"
    with ZipFile(zip_filename, 'w') as zipf:
        for file in filenames:
            zipf.write(file, os.path.basename(file))

    # 刪除臨時 PDF 檔案
    for file in filenames:
        os.remove(file)

    return FileResponse(zip_filename, filename="generated_pdfs.zip", media_type="application/zip")
