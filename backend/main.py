from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.requests import Request
from pydantic import BaseModel
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from openai import OpenAI
from backend.s3_uploader import upload_to_epsondest
import google.generativeai as genai
from PIL import Image
import uuid
import os

#初始化 OpenAI and Gemini
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
print("GEMINI_API_KEY:", os.getenv("GEMINI_API_KEY")[:6])

app = FastAPI()
UPLOAD_DIR = "uploads"
PDF_DIR = "pdf_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PDF_DIR, exist_ok=True)

#記憶Gemini 對話歷史
chat_history = []

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

#test: gemini和gpt
@app.get("/test-gemini")
async def test_gemini():
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content("請提供一個適合用 AI 畫出的有趣場景")
        return {"gemini_response": response.text.strip()}
    except Exception as e:
        return {"error": str(e)}

@app.get("/test-gpt")
async def test_gpt():
    try:
        response = client.chat.completions.create(
            model="gpt-4-1106-preview",
            messages=[
                {"role": "system", "content": "你是提示詞專家，請用英文寫一個適合 DALL·E 圖像生成的 prompt"},
                {"role": "user", "content": "我想畫一隻戴著太空帽的柴犬站在月球上"}
            ]
        )
        return {"gpt_prompt": response.choices[0].message.content.strip()}
    except Exception as e:
        return {"error": str(e)}
    
# 測試chatbot: gemini+gpt
# #開場白
# @app.get("/onboarding")
# async def onboarding():
#     return {
#         "messages": [
#             {
#                 "role": "assistant",
#                 "type": "text",
#                 "content": "嗨我是你的 AI 設計師，Echo 🎨 請問你今天想要設計什麼呢？"
#             },
#             {
#                 "role": "assistant",
#                 "type": "text",
#                 "content": "你可以選擇：\n1️⃣ AI 圖像創作\n2️⃣ 排版成 PDF\n3️⃣ 給我靈感，我幫你想\n\n直接輸入數字或描述也可以喔！"
#             },
#             {
#                 "role": "assistant",
#                 "type": "text",
#                 "content": "如果你有圖片想一起用，也可以上傳，我會幫你加上文字、設計風格，再輸出成漂亮的排版唷！"
#             }
#         ]
#     }

@app.post("/multi-dialogue-to-image")
async def generate_prompt(req: Request):
    try:
        data = await req.json()
        messages = data.get("messages", [])

        # Step 1: 與Gemini對話
        combined_text = ""
        for msg in messages:
            if msg["type"] == "text":
                role = "User" if msg["role"] == "user" else "model"
                chat_history.append({"role": role, "parts": [msg["content"]]})
                image_url = data.get("image_url")
                # combined_text += f"{role}: {msg['content']}\n"

        model = genai.GenerativeModel('gemini-2.0-flash')
        chat = model.start_chat(history = chat_history)
        
        response = chat.send_message("你是專門設計房仲文宣的設計師。請用自然的聊天語氣，告訴我你會怎麼設計這張房仲宣傳海報，可以提到主體（像是建築物、街景）、氣氛、色調和視覺重點。簡短描述就好，不用條列。")
        idea_description = response.text.strip()
        chat_history.append({"role": "model", "parts": [idea_description]})
        print("[Gemini idea]", idea_description)
        
        segments = [s.strip() for s in idea_description.replace("\n", "").split("。") if s.strip()]
        text_messages = [{"role": "assistant", "type": "text", "content": s + "。"} for s in segments] #回複訊息
        image_url = data.get("image_url")
        if image_url:
            text_messages.insert(0,{
                "role": "user",
                "type": "image",
                "image_url": image_url
            })
        
        
        # Step 2: 使用 GPT-4 轉換為 prompt
        try:
            system_msg = """
            你是一位熟悉房仲廣告與建築攝影的圖像提示詞工程師。根據輸入內容，請撰寫英文 prompt，供 DALL·E 圖像生成。請務必包含明確的主體（如建築、街景、房屋外觀），以利生成高品質、具主體性的圖片。

            【光照效果】
            Soft lighting (柔光), Hard lighting (硬光), Backlighting (逆光), Side lighting (側光), Silhouette (剪影), Diffused light (擴散光), Spotlight (聚光), Rim lighting (邊光), Ambient lighting (環境光), Tyndall Effect (泰因達爾效應), Rayleigh Scattering (瑞利散射), God Rays / Crepuscular Rays (耶穌光/暮光射線), Bokeh (散景), Caustics (焦散效果), Chiaroscuro (明暗對比), Gobo Lighting (戈博照明), Halo Effect (光暈效果), Golden hour (黃金時刻)

            【色彩色調】
            Saturated (飽和), Desaturated (去飽和), High Contrast (高對比度), Low Contrast (低對比度), Vibrant (鮮豔), Muted (柔和), Warm Tones (暖色調), Cool Tones (冷色調), Monochromatic (單色調), Duotone (雙色調), Sepia (棕褐色調), Cross Processing (交叉沖印), HDR Toning (HDR調色), Tint (色調添加), Lomo Effect (LOMO效果), Bleach Bypass (漂白繞過), Cyanotype (藍印法), Grain / Film Grain (顆粒感/膠片顆粒), Analog (類比效果)

            【渲染與質感】
            Polaroid Effect (拍立得效果), Octane Render (Octane渲染器), 4K Resolution (4K解析度), Texture Mapping (紋理映射), HDR (High Dynamic Range, 高動態範圍), Matte Painting (數碼彩繪), Glossy Finish (光澤表面), Roughness / Bump Mapping (粗糙度/凸起映射), Cinema 4D (C4D), Blender (混合器), Maya, Arnold Renderer (阿諾德渲染器), V-Ray (V-Ray渲染器), Substance Painter (Substance繪畫器), Quixel Mixer (Quixel混合器), Houdini (胡迪尼)
            
            【構圖技巧與方法】
            Rule of Thirds (三分法則), Leading Lines (引導線), Framing (框架法), Symmetry and Patterns (對稱與圖案), Depth of Field (景深), Negative Space (負空間), Golden Ratio (黃金比例), Focus on Eye Level (注視點層次), Diagonal Composition (對角線構圖), Juxtaposition (並置), Point of View (視點), Color Contrast (色彩對比), Isolation (孤立), S-Curve (S型曲線), Frame Within a Frame (框中框), Dynamic Tension (動態張力), Balance (平衡), Repetition (重複), Vanishing Point (消失點), Selective Focus (選擇性對焦), Symmetry and Asymmetry (對稱與不對稱), High Angle and Low Angle (高角度與低角度)

            【構圖技巧與視角】
            Rule of Thirds (三分法則), Leading Lines (引導線), Framing (框架法), Symmetry and Patterns (對稱與圖案), Depth of Field (景深), Negative Space (負空間), Golden Ratio (黃金比例), Focus on Eye Level (注視點層次), Diagonal Composition (對角線構圖), Juxtaposition (並置), Point of View (視點), Color Contrast (色彩對比), Isolation (孤立), S-Curve (S型曲線), Frame Within a Frame (框中框), Dynamic Tension (動態張力), Balance (平衡), Repetition (重複), Vanishing Point (消失點), Selective Focus (選擇性對焦), Symmetry and Asymmetry (對稱與不對稱), High Angle and Low Angle (高角度與低角度)
            
            請注意：生成的 prompt 最終會用於設計房仲海報，畫面要適合作為廣告主視覺，建議避免過度抽象或無主體的構圖。
            """
            gpt_response = client.chat.completions.create(
                model="gpt-4-1106-preview",
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": idea_description}
                ]
            )
            prompt = gpt_response.choices[0].message.content.strip()
            print("[GPT prompt]", prompt)
        except Exception as gpt_error:
            return JSONResponse(content={"error": f"GPT 錯誤：{str(gpt_error)}"}, status_code=500)

        # Step 3: 使用 DALL·E 生成圖片
        try:
            img_response = client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                n=1,
                size="1024x1024"
            )
            image_url = img_response.data[0].url
        except Exception as dalle_error:
            return JSONResponse(content={"error": f"DALL·E 錯誤：{str(dalle_error)}"}, status_code=500)

        return JSONResponse(content={
            "new_messages": text_messages + [
                # {"role": "assistant", "type": "text", "content": idea_description},# 顯示 Gemini 回覆
                {"role": "assistant", "type": "image", "image_url": image_url} # 顯示圖片
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
            "image_url": f"https://epson-hey-echo.onrender.com/view-image/{file_name}",
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

            upload_status, upload_response = upload_to_epsondest(file_path, file_name)
            print(f"[INFO] Upload to Epson API: {upload_status} - {upload_response}")

            if upload_status != 200:
                return JSONResponse(content={"error": "上傳 PDF 到 Epson 失敗"}, status_code=500)
            pdf_urls.append({
                "layout": layout,
                # "status": upload_status,
                "url": upload_response
            })
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