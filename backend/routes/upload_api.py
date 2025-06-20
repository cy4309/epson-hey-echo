from fastapi import APIRouter, File, UploadFile,Form
from fastapi.responses import JSONResponse,FileResponse
import os,uuid,requests

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload_image")
async def upload_image(file: UploadFile = File(None), image_url: str = Form(None)):
    if file:
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
                "image_url": f"https://epson-hey-echo.onrender.com/view-image/{file_name}",
                "filename": file_name,
                "image_url": image_url,
                "code": 200
                })
    elif image_url:
        try:
            headers = {
                "User-Agent": "Mozilla/5.0"
            }
            response = requests.get(image_url, headers=headers)

            if response.status_code == 200:
                ext = image_url.split("?")[0].split(".")[-1].lower()
                if ext not in ["png", "jpg", "jpeg"]:
                    return JSONResponse(content={"error": "圖片格式不支援"}, status_code=400)
                file_name = f"{uuid.uuid4().hex}.{ext}"
                file_path = os.path.join(UPLOAD_DIR, file_name)
                with open(file_path, "wb") as f:
                    f.write(response.content)
                print(f"[INFO] 已成功下載圖片並儲存為: {file_path}")
                return JSONResponse(
                    content={
                        "message": "圖片已成功下載",
                        "filename": file_name,
                        "image_url": f"https://epson-hey-echo.onrender.com/view-image/{file_name}",
                        "code": 200
                    }
                )
            else:
                print(f"[ERROR] 無法下載圖片，狀態碼: {response.status_code}")
                return JSONResponse(content={"error": "無法下載圖片"}, status_code=400)
        except Exception as e:
            print(f"[ERROR] 圖片下載錯誤: {e}")
            return JSONResponse(content={"error": "下載失敗"}, status_code=500)
    else:
        return JSONResponse(content={"error": "請上傳圖片或提供圖片 URL"}, status_code=400)
    
@router.get("/view-image/{file_name}")
async def view_image(file_name: str):
    file_path = os.path.join(UPLOAD_DIR, file_name)
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found"}, status_code=404)
    return FileResponse(file_path, media_type="image/jpeg")