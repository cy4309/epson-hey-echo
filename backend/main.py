from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from openai import OpenAI
from backend.s3_uploader import upload_image_to_epsondest
from backend.flyer_generator import generate_real_flyer,generate_flyer_from_talk

#Routes
from backend.routes.upload_api import router as upload_router


import google.generativeai as genai
from PIL import Image as PILImage, ImageDraw, ImageFont
import uuid,os,io,re,requests,sys,asyncio

print("CWD =", os.getcwd())
print("PYTHONPATH =", sys.path)
print("backend/ content =", os.listdir("backend"))

#初始化 OpenAI and Gemini
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
print("GEMINI_API_KEY:", os.getenv("GEMINI_API_KEY")[:6])

app = FastAPI()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
font_path = os.path.join(os.getcwd(), "backend", "fonts", "SourceHanSerifTW-Bold.otf")

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
# 掛載所有子路由
app.include_router(upload_router)

@app.get("/")
async def root():
    return {"message":"Backend is alive !!!"}

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
                image_filename = image_url.replace("undefined", "")
                print(f"[INFO] image_url，從{image_url} 到 {image_filename}")
            else:
                image_filename = image_url.split("/")[-1] if "/" in image_url else image_url
                
            # 檢查文件是否存在
            image_path = os.path.join(UPLOAD_DIR, image_filename)
            print(f"[INFO] 檢查除片文件: {image_path}, 存在: {os.path.exists(image_path)}")
            
            if not os.path.exists(image_path) and image_url.startswith("http"):
                try:
                    print(f"[INFO] 從 URL 下載圖片: {image_url}")
                    response = requests.get(image_url)
                    if response.status_code == 200:
                        with open(image_path, "wb") as f:
                            f.write(response.content)
                        print(f"[INFO] 成功下載圖片到 {image_path}")
                        image_url = f"https://epson-hey-echo.onrender.com/view-image/{image_filename}"
                        data["image_url"] = image_url
                        image_url = data["image_url"]

                    else:
                        print(f"[ERROR] 從 URL 下載失敗，狀態碼: {response.status_code}")
                        return JSONResponse(content={"error": "圖片下載失敗"}, status_code=400)
                except Exception as e:
                    print(f"[ERROR] 下載圖片過程出錯: {e}")
                    return JSONResponse(content={"error": "圖片下載失敗"}, status_code=500)
                
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
                # image_url = data.get("image_url")
                combined_text += f"{role}: {msg['content']}\n"

        # 如果包含指定關鍵語句，走「合成房仲海報邏輯」
        trigger_keywords = ["合成", "建築","宣傳單"]
        # user_text = combined_text.lower().strip()
        user_text ="\n".join([
            msg["content"] for msg in messages 
            if msg["type"] == "text" and msg["role"] == "user"
        ]).strip().lower()
        #region<Demo>
        # # Demo 模式：若輸入包含 demo 且沒傳圖片，就自動用 Demo.png
        # if "demo" in user_text and not image_url:
        #     print("[INFO] demo 模式觸發，開始模擬處理延遲...")
        #     await asyncio.sleep(5) 
        #     image_url = "https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/27011900_demo_f1.png"
        #     print("[INFO] demo 模式觸發，自動套用 Demo 圖:", image_url)

        #     # 模擬前端傳來的 image_url 進行後續處理
        #     data["image_url"] = image_url
        #     image_filename = image_url.split("/")[-1]
        #     image_path = os.path.join(UPLOAD_DIR, image_filename)

        #     if not os.path.exists(image_path):
        #         try:
        #             print("[INFO] 開始下載 demo 圖片...")
        #             response = requests.get(image_url)
        #             if response.status_code == 200:
        #                 with open(image_path, "wb") as f:
        #                     f.write(response.content)
        #                 print(f"[INFO] 成功下載 demo 圖片到: {image_path}")
        #             else:
        #                 print(f"[ERROR] 無法下載 demo 圖片，狀態碼: {response.status_code}")
        #                 return JSONResponse(content={"error": "下載 demo 圖片失敗"}, status_code=400)
        #         except Exception as e:
        #             print(f"[ERROR] demo 圖片下載錯誤: {e}")
        #             return JSONResponse(content={"error": "demo 圖片下載錯誤"}, status_code=500)
        #endregion<Demo>
        # # Demo 模式：若輸入包含 demo 且沒傳圖片，就自動用 Demo.png(end)
        has_trigger = any(keyword in user_text for keyword in trigger_keywords)
        has_image = bool(image_url)
        is_demo_mode = False # (目前已關閉)判斷是否是 demo 模式

        print("[使用者訊息]", user_text)
        print("[Trigger 判斷]", has_trigger, "| 有圖片:", has_image)
        
        if has_trigger and has_image:
            
            matched = any(keyword in user_text for keyword in trigger_keywords) and (image_url)
            print("[Trigger 是否觸發]", matched,".有圖片", bool(image_url))

            # 產純色背景（用 Pillow 產圖）
            width, height = 1024, 1792
            bg_color = "#264432"
            bottom_color = "#F8F1D7"
            poster = PILImage.new("RGB", (width, height), bg_color)
            draw = ImageDraw.Draw(poster)
            draw.rectangle([0, height * 0.75, width, height], fill=bottom_color)        

            # 疊建築圖
            if image_url:
                # demo 模式:不用 Pillow，直接回傳原圖
                if is_demo_mode:
                    print("[INFO] demo 模式，不經過 Pillow 處理，直接回傳原圖 URL")
                    response_messages = [
                        {"role": "assistant", "type": "text", "content": "這是為您設計的宣傳單"},
                        {"role": "assistant", "type": "image", "image_url": image_url}
                    ]
                    return JSONResponse(content={
                        "new_messages": response_messages,
                        "image_filename": image_url.split("/")[-1],
                        "next_step": "await_flyer_info"
                    })
                else:
                # 一般流程 :使用 Pillow 合圖
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
                        {"role": "assistant", "type": "image", "image_url": image_url},
                        {
                            "role": "assistant",
                            "type": "text",
                            "content": "這是我幫你合成的底圖！\n\n接下來請直接輸入以下資訊，我會自動幫你完成整張房仲宣傳單：\n\n 坪數、總價、特點、聯絡人、聯絡資訊及Logo格式不限，直接輸入內容即可！"
                        },
                    ]
                    print(f"[INFO] 上傳结果: 狀態={status}, URL={image_url}")
                    return JSONResponse(content={
                        "new_messages": response_messages,
                        "image_filename": fileName
                        # "next_step": "await_flyer_info"
                    })

                except Exception as upload_error:
                    print(f"[ERROR] 上傳到Epson失敗: {upload_error}")
                    image_url = f"https://epson-hey-echo.onrender.com/view-image/{fileName}"
                    # 回復設計理念
                    model = genai.GenerativeModel('gemini-2.0-flash')
                    response = model.generate_content("請用簡短文字介紹這張房仲海報的設計思路和特色，不超過50字")
                    idea_description = response.text.strip()
                    print("[Gemini response]", idea_description)
                    # 測試引導
                    response_messages = [
                        {"role": "assistant", "type": "image", "image_url": image_url},
                        {"role": "assistant", "type": "text", "content": "這是建築圖片底圖，請補上坪數、總價與聯絡資訊，我會幫您合成完整房仲宣傳單！"}
                    ]

                    return JSONResponse(content={
                        "new_messages": response_messages,
                        "image_filename": image_filename,
                        "next_step": "await_flyer_info"
                    })

        elif user_text:
                print("[Fallback] 沒有圖片或不合成，進入 DALL·E 圖像生成邏輯")
                # Step 2: 使用 GPT-4 轉換為 prompt
                try:
                    system_msg = """
                    You are a professional visual prompt engineer specializing in real estate ads and flat poster design. Your job is to write natural, vivid English prompts for DALL·E to generate clean poster backgrounds in a minimalist, editorial flat illustration style.

                    Prompt constraints:
                    - Format: Vertical A4
                    - Style: Flat illustration, minimalist, editorial print design
                    - No text, logos, UI elements, mockups, shadows, or depth effects
                    - Clean composition with generous negative space for future text
                    - Colors: warm palette, earthy tones, or pastel duotone
                    - No mockup scenes: strictly avoid desks, frames, stationery, decorative borders, or interior staging
                    - This is not a design proposal or style guide. Do not include color swatches, palette blocks, sample bars, numbered labels, layout grids, A4 indicators, or any presentation-like elements

                    You should write prompts that sound like the following:

                    "Create a vertical A4 flat illustration in a minimalist and editorial design style, featuring the exterior of a festive coffee shop decorated with Christmas ornaments and warm lights. Use a warm palette with muted earthy tones. Ensure a clean composition with ample negative space for future layout. Do not include any color references, layout grids, or presentation elements. The image should be a pure full-scene illustration — no surrounding borders, no color strips, no framing, and no background canvas."

                    Always follow this sentence style. Describe the main subject clearly, specify visual style and color tone, and end with layout clarity instructions.

                    Now, based on the user’s input, write one complete sentence in this style. No explanation. No additional notes.
                    """

                    gpt_response = client.chat.completions.create(
                        model="gpt-4o-2024-08-06",#gpt-4-1106-preview, gpt-4o-2024-08-06
                        messages=[
                            {"role": "system", "content": system_msg},
                            {"role": "user", "content": user_text}
                        ]
                    )
                    idea = gpt_response.choices[0].message.content.strip()
                    print("[GPT refined idea]", idea)

                    # 加上固定 prompt 樣板
                    prompt = idea
                    print("[Final Prompt to DALL·E]", prompt)
                except Exception as gpt_error:
                    return JSONResponse(content={"error": f"GPT 錯誤：{str(gpt_error)}"}, status_code=500)

                # Step 3: 生成圖片
                try:
                    img_response = client.images.generate(
                        model="gpt-image-1", #dall-e-3, dall-e-3-preview
                        prompt=prompt,
                        n=1,
                        size="1024x1536" #A4尺寸:1024x1792
                    )
                    # image_url = img_response.data[0].url #0528_因為不走DALL·E，所以這行不會用到

                    #region<gpt-image-1>
                    b64_data = img_response.data[0].b64_json #0528_改成用 base64
                    filename  = f"{uuid.uuid4().hex}.png"
                    filepath  = os.path.join(UPLOAD_DIR, filename)
                    with open(filepath, "wb") as f:
                        f.write(base64.b64decode(b64_data))
                    print(f"[INFO] 已解碼並儲存 {filepath}")

                    status, image_url = upload_image_to_epsondest(filepath, filename)
                    if status != 200 or not image_url or image_url == "null":
                        print("[WARN] Epson 回傳異常，改用本地 URL")
                        image_url = f"https://epson-hey-echo.onrender.com/view-image/{filename}"
                    #endregion<gpt-image-1o>
                    
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

# API ：生成五張圖，每個應用不同排版方式
@app.post("/generate-multiple-images")
async def generate_multiple_images(
    image_filename: str = Form(...), #檔名成稱
    content: str = Form(...), #文字內容
    font_size: int = Form(34), #字體大小
    code: int = Form(200)
):
    try:
        width, height = 1024, 1792 #(2480, 3508) or (1024, 1792)
        img_urls = []
        # 定義五種排版方式的位置
        layouts = ["topLeft", "topRight", "center", "bottomLeft", "bottomRight"]
        center_bias_y = -10 
        bottom_bias_y = 80
        horizontal_offset = 40  # 控制左右內縮距離
        vertical_offset = 160    # 控制上下間距
          

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
        for layout in layouts:
            try:
                fileName = f"{uuid.uuid4().hex}_{layout}.png"
                file_path = os.path.join(UPLOAD_DIR, fileName)
                print(f"[INFO] 處理排版 {layout}, 儲存到 {file_path}")

                img = PILImage.open(image_path).convert("RGB")
                img_width, img_height = img.size
                # 調整圖片大小以適應A4
                scale = max(width / img_width, height / img_height)
                adjusted_font_size = int(font_size * scale * 3 ) #調整字體大小(預設80)
                print(f"[DEBUG] 原始 font_size: {font_size}, 調整倍率 scale: {scale}, 最終 adjusted_font_size: {adjusted_font_size}")

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
                    font = ImageFont.truetype(font_path, adjusted_font_size)
                except Exception as font_error:
                    print(f"[WARNING] 字型載入失敗: {font_error}, 使用預設字型")
                    font = ImageFont.load_default()

                text_bbox = draw.textbbox((0, 0), content, font=font)
                text_width = text_bbox[2] - text_bbox[0]
                text_height = text_bbox[3] - text_bbox[1]

                # 根據 layout 計算位置
                if layout == "topLeft":
                    x = img_x + horizontal_offset
                    y = img_y + vertical_offset
                elif layout == "topRight":
                    x = img_x + new_width - text_width -  horizontal_offset
                    y = img_y + vertical_offset
                elif layout == "center": 
                    x = img_x + (new_width - text_width) / 2
                    y = img_y + (new_height - text_height) / 2 + center_bias_y
                elif layout == "bottomLeft":
                    x = img_x + horizontal_offset 
                    y = img_y + new_height - text_height - vertical_offset - bottom_bias_y
                elif layout == "bottomRight":
                    x = img_x + new_width - text_width - horizontal_offset
                    y = img_y + new_height - text_height - vertical_offset - bottom_bias_y

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
    
# API ：生成房仲海報    
@app.post("/generate-final-flyer")
async def generate_final_flyer(
    image_file: UploadFile = File(...),
    logo_file: UploadFile = File(None),
    main_title: str = Form(...),
    subtitle: str = Form(...),
    features: str = Form(...),
    area: str = Form(...),
    price: str = Form(...),
    agent_name: str = Form(...),
    agent_phone: str = Form(...),
    store_name: str = Form(...),
    store_phone: str = Form(...),
    address: str = Form(...)
):
    # 儲存建築圖片
    building_filename = f"{uuid.uuid4().hex}_{image_file.filename}"
    building_path = os.path.join("uploads", building_filename)
    with open(building_path, "wb") as f:
        f.write(await image_file.read())

    # 儲存 logo
    if logo_file:
        logo_filename = f"{uuid.uuid4().hex}_{logo_file.filename}"
        logo_path = os.path.join("uploads", logo_filename)
        with open(logo_path, "wb") as f:
            f.write(await logo_file.read())
    else:
        logo_path = os.path.join("icons", "default_logo.png")  # 預設 logo

    # 開始合成圖
    width, height = 2480, 3508
    poster = PILImage.new("RGB", (width, height), "#264432")
    draw = ImageDraw.Draw(poster)

    # 字型
    try:
        title_font = ImageFont.truetype("fonts/SourceHanSerifTW-Bold.otf", 64)
    except:
        title_font = ImageFont.load_default()

    normal_font = ImageFont.load_default()

    # 上方主標題
    draw.text((80, 50), main_title, font=title_font, fill="#F8F1D7")
    draw.text((80, 140), subtitle, font=normal_font, fill="#F8F1D7")

    # 建築圖片
    try:
        img = PILImage.open(building_path).convert("RGBA")
        img_w, img_h = img.size
        scale = width * 0.8 / img_w
        img_resized = img.resize((int(img_w * scale), int(img_h * scale)))
        x = (width - img_resized.width) // 2
        y = 240
        poster.paste(img_resized, (x, y), img_resized)
    except Exception as e:
        print("[ERROR] Failed to paste building image:", e)

    # ICON 區塊
    icon_names = ["tree.png", "sun.png", "music.png", "mrt.png"]
    feature_texts = features.strip().split("\n")[:4]
    icon_y = y + img_resized.height + 30
    icon_x_start = 100
    gap = 260
    for i, icon_name in enumerate(icon_names):
        try:
            icon = PILImage.open(os.path.join("icons", icon_name)).convert("RGBA").resize((80, 80))
            x = icon_x_start + i * gap
            poster.paste(icon, (x, icon_y), icon)
            # 對應說明
            lines = feature_texts[i].split(" ")
            for j, line in enumerate(lines):
                draw.text((x, icon_y + 90 + j * 28), line, font=normal_font, fill="white")
        except Exception as e:
            print(f"[WARNING] Failed to load icon {icon_name}: {e}")

    # 數據區塊（坪數 / 價格）
    data_y = icon_y + 200
    draw.text((100, data_y), f"{area} 坪", font=title_font, fill="white")
    draw.text((width // 2, data_y), f"{price} 萬", font=title_font, fill="white")

    # 灰底資訊區塊
    info_y = data_y + 120
    draw.rectangle([0, info_y, width, height], fill="#F8F1D7")
    draw.text((100, info_y + 30), f"{agent_name}｜{agent_phone}", font=normal_font, fill="black")
    draw.text((100, info_y + 70), f"{store_name}｜{store_phone}", font=normal_font, fill="black")
    draw.text((100, info_y + 110), address, font=normal_font, fill="black")

    # 貼上 logo
    try:
        logo = PILImage.open(logo_path).convert("RGBA").resize((160, 80))
        poster.paste(logo, (width - 200, info_y + 30), logo)
    except Exception as e:
        print("[WARNING] 無法貼 logo：", e)

    # 輸出圖片
    final_filename = f"{uuid.uuid4().hex}_final.png"
    final_path = os.path.join("uploads", final_filename)
    poster.save(final_path)

    return JSONResponse(content={
        "message": "海報已生成",
        "image_url": f"https://epson-hey-echo.onrender.com/view-image/{final_filename}"
    })