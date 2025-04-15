from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
# from fastapi.requests import Request
from pydantic import BaseModel
from reportlab.lib.pagesizes import A4
# from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from openai import OpenAI
from backend.s3_uploader import upload_image_to_epsondest
import google.generativeai as genai
from PIL import Image as PILImage, ImageDraw, ImageFont
import uuid,os,io,re

import os, sys
print("CWD =", os.getcwd())
print("PYTHONPATH =", sys.path)
print("backend/ content =", os.listdir("backend"))

#初始化 OpenAI and Gemini
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
print("GEMINI_API_KEY:", os.getenv("GEMINI_API_KEY")[:6])

app = FastAPI()
UPLOAD_DIR = "uploads"
# IMG_DIR = "img_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)
# os.makedirs(IMG_DIR, exist_ok=True)

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
        print("[DEBUG] raw body:", data)
        messages = data.get("messages", [])
        
        #處理圖片url
        image_url = data.get("image_url")
        if image_url in [None, "", "undefined"]:
            image_url = None
        print("[原始 image_url]", image_url)
        
        if image_url and isinstance(image_url, str):
            if image_url.startswith("undefined"):
                # 去除undefined
                image_filename = image_url.replace("undefined", "")
                print(f"[INFO] image_url，從{image_url} 到 {image_filename}")
            else:
                image_filename = image_url.split("/")[-1] if "/" in image_url else image_url
                
            # 檢查文件是否存在
            image_path = os.path.join(UPLOAD_DIR, image_filename)
            print(f"[INFO] 檢查除片文件: {image_path}, 存在: {os.path.exists(image_path)}")
            
            if os.path.exists(image_path):
                data["image_url"] = f"https://epson-hey-echo.onrender.com/view-image/{image_filename}"
                print(f"[INFO] 更新image_url為: {data['image_url']}")
            else:
                print(f"[ERROR] 圖片文件不存在: {image_path}")
                return JSONResponse(content={"error": "圖片文件不存在"}, status_code=404)

        # Step 1: 與Gemini對話
        combined_text = ""
        for msg in messages:
            if msg["type"] == "text":
                role = "User" if msg["role"] == "user" else "model"
                chat_history.append({"role": role, "parts": [msg["content"]]})
                image_url = data.get("image_url")
                combined_text += f"{role}: {msg['content']}\n"

        # 如果包含指定關鍵語句，走「合成房仲海報邏輯」
        trigger_keywords = ["合成", "建築","宣傳單"]
        # user_text = combined_text.lower().strip()
        user_text ="\n".join([
            msg["content"] for msg in messages 
            if msg["type"] == "text" and msg["role"] == "user"
        ]).strip().lower()
        has_trigger = any(keyword in user_text for keyword in trigger_keywords)
        has_image = bool(image_url)
        print("[使用者訊息]", user_text)
        print("[Trigger 判斷]", has_trigger, "| 有圖片:", has_image)
        
        if has_trigger and has_image:
            matched = any(keyword in user_text for keyword in trigger_keywords) and (image_url)
            print("[Trigger 是否觸發]", matched,".有圖片", bool(image_url))

            # 產純色背景（用 Pillow 產圖）
            width, height = 1240, 1754
            bg_color = "#264432"
            bottom_color = "#F8F1D7"
            poster = PILImage.new("RGB", (width, height), bg_color)
            draw = ImageDraw.Draw(poster)
            draw.rectangle([0, height * 0.75, width, height], fill=bottom_color)        

            # 疊建築圖
            if image_url:
                try:
                    fg = PILImage.open(image_path).convert("RGBA")
                    print(f"[INFO] 成功加載圖片: {image_path}")

                    # resize + paste
                    ratio = width * 0.8 / fg.width
                    fg_resized = fg.resize((int(fg.width * ratio), int(fg.height * ratio)))
                    x = (width - fg_resized.width) // 2
                    y = int(height * 0.35 - fg_resized.height / 2)
                    poster.paste(fg_resized, (x, y), fg_resized)
                    print("[INFO] 圖片成功合成到海报")
                except Exception as img_error:
                    print(f"[ERROR] 圖片處理失败: {img_error}")
                    return JSONResponse(content={"error": f"圖片處理失败: {str(img_error)}"}, status_code=500)

                # 加上文字
                try:
                    font_h1 = ImageFont.truetype("arial.ttf", 72)
                    font_h2 = ImageFont.truetype("arial.ttf", 40)
                    font_cta = ImageFont.truetype("arial.ttf", 36)
                except:
                    font_h1 = font_h2 = font_cta = ImageFont.load_default()

                # 儲存圖片
                fileName = f"{uuid.uuid4().hex}.png"
                filepath = os.path.join(UPLOAD_DIR, fileName)
                poster.save(filepath, format="PNG")
                print(f"[INFO] 成功儲存宣傳單: {filepath}")
                
                # 上傳 Epson
                try:
                    status, image_url = upload_image_to_epsondest(filepath, fileName)
                    if status != 200 or not image_url or image_url == "null":
                        print(f"[WARNING] 上傳Epson失敗或回傳 URL 無效，使用本地 URL")

                        image_url = f"https://epson-hey-echo.onrender.com/view-image/{fileName}"
                    response_messages = [
                        {"role": "assistant", "type": "text", "content": "以下為您生成的房仲宣傳單"},
                        {"role": "assistant", "type": "image", "image_url": image_url}
                    ]
                    print(f"[INFO] 上傳结果: 狀態={status}, URL={image_url}")
                    
                    if status != 200:
                        print(f"[WARNING] 上傳Epson失敗，使用本地URL")
                        image_url = f"https://epson-hey-echo.onrender.com/view-image/{fileName}"
                except Exception as upload_error:
                    print(f"[ERROR] 上傳到Epson失敗: {upload_error}")
                    image_url = f"https://epson-hey-echo.onrender.com/view-image/{fileName}"
                    # 回復設計理念
                    model = genai.GenerativeModel('gemini-2.0-flash')
                    response = model.generate_content("請用簡短文字介紹這張房仲海報的設計思路和特色，不超過50字")
                    idea_description = response.text.strip()
                    print("[Gemini response]", idea_description)
                    
                    response_messages = [
                    {"role": "assistant", "type": "text", "content": "以下為您生成的房仲宣傳單"},
                    {"role": "assistant", "type": "image", "image_url": image_url}
                    ]
                return JSONResponse(content={
                    "new_messages": response_messages
                })
        elif user_text:
                print("[Fallback] 沒有圖片或不合成，進入 DALL·E 圖像生成邏輯")
                # Step 2: 使用 GPT-4 轉換為 prompt
                try:
                    system_msg = """
                    # 你是一位熟悉房仲廣告與建築攝影的圖像提示詞工程師，根據輸入內容撰寫英文 prompt，供 DALL·E 生成海報背景。
                    
                    # 圖片需求：
                    # - A4 尺寸、直式構圖
                    # - 無文字、LOGO、裝飾元素

                    # 請從以下分類中，各選擇 1-2 種風格，並以逗號句式組成一段描述，供 DALL·E 使用：
                    # 【插畫與風格類型】
                    # Flat Illustration (扁平插畫), Watercolor Illustration (水彩插畫), Vector Art (向量圖風), Paper-cut Style (紙雕風格), Collage Style (拼貼風), Editorial Illustration (編輯插畫), Isometric Design (等距構圖), Retro Graphic Design (復古平面設計), Mid-century Modern (中世紀現代風), Japanese Minimalist (日系極簡), Scandinavian Style (北歐風格), Children’s Book Illustration (童書插畫風), Line Art (線條插畫), Cutout Shapes (剪紙構成),editorial print design(印刷設計)

                    # 【色彩色調】
                    # Muted Colors (柔和色系), Pastel Tones (粉彩色調), Earthy Tones (大地色系), Warm Palette (暖色系), Cool Palette (冷色系), Monochrome Design (單色設計), Duotone Graphic (雙色設計), Limited Color Palette (限制配色), High Contrast Colors (高對比色), Color Blocking (色塊構成)
                                        
                    # 【構圖技巧與方法】
                    # Centered Composition (中心構圖), Symmetry & Asymmetry (對稱與非對稱), Negative Space Usage (負空間運用), Grid-based Layout (網格系統排版), Focal Object Emphasis (視覺焦點集中), Repetition of Shapes (形狀重複), Framing with Shapes (幾何框架構圖), Abstract Geometric Layout (幾何抽象構圖), Minimalist Structure (極簡結構), Layered Cutout Composition (分層紙雕構圖), Organic Flow Composition (有機流動構圖)

                    # 【構圖技巧與視角】
                    # Top-down View (俯視構圖), Flat Lay Design (平鋪構圖), Front View (正面構圖), Isometric Perspective (等距視角), Center-aligned View (置中構圖), Symmetrical Balance (視覺平衡), Minimal Depth (無透視層次), Single Object Focus (單物主角)

                    # 【附加風格提示（可混搭）】
                    # No Text, No Letters, No Logos (無文字、無字母、無標誌), Poster Composition (海報感排版), Flyer Proportions (傳單比例), Clean Background (淨白或純色背景), Design for Print (印刷設計用途), Soft Texture Overlay (柔和紋理疊加), High Resolution Illustration (高解析插畫)

                    
                    # 請注意：生成的 prompt 最終會用於設計平面海報，畫面要適合作為廣告主視覺，建議避免過度抽象或無主體的構圖。
                    你是一位平面設計專家，擅長撰寫 DALL·E 圖像生成提示詞，用於產出單一主圖的扁平設計插畫（例如咖啡廳宣傳、商品視覺、房地產廣告等）。

                    請根據使用者描述產出**一段英文 prompt**，用於生成一張 A4 尺寸的直式圖像，風格應符合以下條件：

                    - Flat illustration / Paper-cut / Minimalist / Editorial design 風格
                    - 不要有 3D 效果、光影或透視
                    - 不要出現 mockup、展示板、背景紙張、陰影、邊框、配色球、UI 元素
                    - 僅顯示主圖主體本身，構圖乾淨，四周保留排版空間
                    - 色系建議使用：warm palette, earthy tones, or pastel tones

                    請以一句完整自然的英文描述輸出 prompt，不要中英混排，不要加上任何補充說明。
                    """
                    gpt_response = client.chat.completions.create(
                        model="gpt-4-1106-preview",
                        messages=[
                            {"role": "system", "content": system_msg},
                            {"role": "user", "content": user_text}
                        ]
                    )
                    idea = gpt_response.choices[0].message.content.strip()
                    print("[GPT refined idea]", idea)

                    # 加上固定 prompt 樣板
                    prompt = idea
                    # """
                    # A vertical A4 real estate poster background layout.
                    # Centered composition with clean empty margins. 
                    # No text, no UI.
                    # Only the illustration itself on a plain background.
                    # """.strip()

                    print("[Final Prompt to DALL·E]", prompt)
                except Exception as gpt_error:
                    return JSONResponse(content={"error": f"GPT 錯誤：{str(gpt_error)}"}, status_code=500)

                # Step 3: 使用 DALL·E 生成圖片
                try:
                    img_response = client.images.generate(
                        model="dall-e-3",
                        prompt=prompt,
                        n=1,
                        size="1024x1792" #A4尺寸
                    )
                    image_url = img_response.data[0].url
                    # Gemini 設計師風格說話
                    model = genai.GenerativeModel('gemini-2.0-flash')
                    chat = model.start_chat(history = chat_history)
                    response = chat.send_message("你是專業的平面設計師，請用親切但專業的語氣，告訴我你會怎麼構思這個畫面。不要條列，像是你正在跟團隊講話一樣。不用條列，只要簡短描述就好。")
                    idea_description = response.text.strip()
                    chat_history.append({"role": "model", "parts": [idea_description]})
                    print("[Gemini idea]", idea_description)

                    segments = [s.strip() for s in idea_description.replace("\n", "").split("。") if s.strip()]
                    text_messages = [{"role": "assistant", "type": "text", "style":"designer", "content": s + "。"} for s in segments]
                                        
                except Exception as dalle_error:
                    return JSONResponse(content={"error": f"DALL·E 錯誤：{str(dalle_error)}"}, status_code=500)

                return JSONResponse(content={
                    "new_messages": text_messages + [
                        {"role": "assistant", "type": "image", "image_url": image_url} # 顯示圖片
                    ]
                })
        
    except Exception as e:
        print("[ERROR] generate-image:", e)
        return JSONResponse(content={"error": str(e)}, status_code=500)


# API ：上傳圖片
@app.post("/upload_image")
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
                "code": 200
                })
    elif image_url:
        file_name = image_url.split("/")[-1] 
        print("[INFO] submitSelectedImage 傳來的圖片 URL:", image_url)
        return JSONResponse(
            content={
                "message": "我已收到你選擇的圖片",
                "filename": file_name,
                "code": 200
            })
    else:
        return JSONResponse(content={"error": "請上傳圖片或提供圖片 URL"}, status_code=400)

@app.get("/view-image/{file_name}")
async def view_image(file_name: str):
    file_path = os.path.join(UPLOAD_DIR, file_name)
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found"}, status_code=404)
    return FileResponse(file_path, media_type="image/jpeg")

# API ：生成五張圖，每個應用不同排版方式
@app.post("/generate-multiple-images")
async def generate_multiple_images(
    image_filename: str = Form(...), #檔名成稱
    content: str = Form(...), #文字內容
    font_size: int = Form(30), #字體大小
    code: int = Form(200)
):
    try:
        width, height = 595, 842
        img_urls = []
        # 定義五種排版方式的位置
        positions = {
            "topLeft": (40, 40),
            "topRight": (width - 140, 40),
            "center": (width / 2 - 50, height / 2),
            "bottomLeft": (40, height - 40),
            "bottomRight": (width - 140, height - 40),
        }

        # image_path = os.path.join(UPLOAD_DIR, image_filename)
        # if not os.path.exists(image_path):
        #     return JSONResponse(content={"error": "圖片檔案不存在"}, status_code=400)
        # 如果 image_filename 是一整串 URL，嘗試從遠端下載圖檔
        if image_filename.startswith("http"):
            print(f"[INFO] image_filename 是 URL: {image_filename}")
            try:
                response = requests.get(image_filename)
                if response.status_code == 200:
                    ext = image_filename.split("?")[0].split(".")[-1]
                    tmp_filename = f"{uuid.uuid4().hex}.{ext}"
                    image_path = os.path.join(UPLOAD_DIR, tmp_filename)
                    with open(image_path, "wb") as f:
                        f.write(response.content)
                    print(f"[INFO] 已從 URL 儲存圖片為本地: {image_path}")
                else:
                    return JSONResponse(content={"error": "無法從 URL 取得圖片"}, status_code=400)
            except Exception as e:
                print(f"[ERROR] 圖片下載失敗: {e}")
                return JSONResponse(content={"error": "圖片下載失敗"}, status_code=500)
        else:
            # 原本邏輯保留
            image_path = os.path.join(UPLOAD_DIR, image_filename)
            if not os.path.exists(image_path):
                return JSONResponse(content={"error": "圖片檔案不存在"}, status_code=400)

        
        # 對結果進行更詳細的打印
        print(f"[INFO] 開始處理圖片: {image_path}")
        print(f"[INFO] 圖片存在: {os.path.exists(image_path)}")
        print(f"[INFO] 文字內容: {content}")
        
        successful_urls = []
        errors = []
        

        # 為每種排版生成獨立的 image
        for layout, (x, y) in positions.items():
            try:
                fileName = f"{uuid.uuid4().hex}_{layout}.png"
                file_path = os.path.join(UPLOAD_DIR, fileName)
                print(f"[INFO] 處理排版 {layout}, 儲存到 {file_path}")

                img = PILImage.open(image_path).convert("RGB")
                img_width, img_height = img.size
                # 調整圖片大小以適應A4
                scale = max(width / img_width, height / img_height)
                # adjusted_font_size = int(font_size * scale * 0.8) #調整字體大小
                new_width = int(img_width * scale)
                new_height = int(img_height * scale)
                img_resized = img.resize((new_width, new_height))
                
                # 建立新的 A4 背景
                poster = PILImage.new("RGB", (width, height), (255, 255, 255))
                draw = ImageDraw.Draw(poster)

                # 將背景圖貼上
                img_x = (width - new_width) // 2
                img_y = (height - new_height) // 2
                poster.paste(img_resized, (img_x, img_y))

                # 載入字型
                try:
                    font = ImageFont.truetype("arial.ttf", font_size)
                except Exception as font_error:
                    print(f"[WARNING] 字型載入失敗: {font_error}, 使用預設字型")
                    font = ImageFont.load_default()

                draw.text((x, y), content, font=font, fill=(255, 255, 255))

                # 儲存並上傳
                poster.save(file_path, format="PNG")
                print(f"[INFO] 成功儲存圖片: {file_path}")
                
                # 上傳到 S3
                try:
                    upload_status, upload_url = upload_image_to_epsondest(file_path, fileName)
                    print(f"[INFO] 上傳結果: 狀態={upload_status}, URL={upload_url}")
                    if upload_status == 200 and upload_url:
                        if upload_url.startswith("http") and "s3.ap-northeast-1.amazonaws.com" in upload_url:
                            img_url = upload_url  # 直接是合法 URL
                        elif "blender-render/epson" in upload_url:  # 只是一段 key
                            img_url = f"https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/{upload_url}"
                        elif upload_url == "null" or upload_url.strip() == "":
                            print("[WARN] Epson 回傳 'null'，使用 fallback")
                            img_url = f"https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/{fileName}"
                        else:
                            print("[WARN] URL 格式未知，仍嘗試用 fallback URL")
                            img_url = f"https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/{fileName}"

                        successful_urls.append(img_url)
                        print(f"[INFO] 添加URL: {img_url}")
                    else:
                        # 如果上傳失敗，使用本地URL
                        local_url = f"https://epson-hey-echo.onrender.com/view-image/{fileName}"
                        successful_urls.append(local_url)
                        print(f"[INFO] 上傳失敗，使用本地URL: {local_url}")
                except Exception as upload_error:
                    print(f"[ERROR] 上傳圖片失敗: {upload_error}")
                    local_url = f"https://epson-hey-echo.onrender.com/view-image/{fileName}"
                    successful_urls.append(local_url)
                    errors.append(f"排版 {layout} 上傳失敗: {str(upload_error)}")
                    
            except Exception as layout_error:
                print(f"[ERROR] 處理排版 {layout} 時出錯: {layout_error}")
                errors.append(f"排版 {layout} 處理失敗: {str(layout_error)}")
                continue
                        
        response_content ={
            "img_urls": successful_urls,
            "code":200
            }
        
        if errors:
            response_content["errors"] = errors
            
        print(f"[INFO] 完成處理，返回 {len(successful_urls)} 個URL")
        return JSONResponse(content=response_content)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/view-image/{fileName}")
async def view_img(fileName: str):
    file_path = os.path.join(UPLOAD_DIR, fileName)
    if not os.path.exists(file_path):
        return JSONResponse(content={"error": "File not found"}, status_code=404)
    return FileResponse(file_path, media_type="image/png")