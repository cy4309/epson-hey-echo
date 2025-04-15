from fastapi import FastAPI, Form, Request
from fastapi.responses import JSONResponse
from PIL import Image as PILImage, ImageDraw, ImageFont
import os, uuid

app = FastAPI()
UPLOAD_DIR = "uploads"
ICON_DIR = "icons"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/generate_real_flyer")
async def generate_real_flyer(
    title: str = Form(...),
    selling_point1: str = Form(...),
    selling_point2: str = Form(...),
    selling_point3: str = Form(...),
    selling_point4: str = Form(...),
    area: str = Form(...),
    price: str = Form(...),
    agent: str = Form(...),
    phone: str = Form(...),
    store: str = Form(...),
    store_phone: str = Form(...),
    address: str = Form(...),
    image_filename: str = Form(...)
):
    width, height = 1240, 1754
    poster = PILImage.new("RGB", (width, height), "#264432")
    draw = ImageDraw.Draw(poster)

    try:
        font_title = ImageFont.truetype("arial.ttf", 100)
        font_sub = ImageFont.truetype("arial.ttf", 48)
        font_text = ImageFont.truetype("arial.ttf", 36)
    except:
        font_title = font_sub = font_text = ImageFont.load_default()

    draw.text((100, 50), title, font=font_title, fill="#F8F1D7")

    img_path = os.path.join(UPLOAD_DIR, image_filename)
    if not os.path.exists(img_path):
        return JSONResponse(content={"error": "找不到圖片"}, status_code=404)
    building = PILImage.open(img_path).convert("RGB")
    building_resized = building.resize((1040, 600))
    poster.paste(building_resized, (100, 180))

    selling_points = [selling_point1, selling_point2, selling_point3, selling_point4]
    icons = ["tree.png", "sun.png", "music.png", "bus.png"]
    for i, (text, icon_name) in enumerate(zip(selling_points, icons)):
        x = 100 + i * 280
        y = 820
        try:
            icon_path = os.path.join(ICON_DIR, icon_name)
            icon = PILImage.open(icon_path).resize((64, 64))
            poster.paste(icon, (x, y))
        except:
            print(f"[WARNING] 找不到 icon: {icon_name}")
        draw.text((x, y + 80), text, font=font_text, fill="white")

    draw.text((100, 1050), f"坪數  {area} 坪", font=font_sub, fill="white")
    draw.text((600, 1050), f"總價  {price} 萬", font=font_sub, fill="white")

    draw.rectangle([0, 1150, width, 1350], fill="#E7DEC8")
    draw.text((100, 1170), f"預約賞屋  {agent}  {phone}", font=font_sub, fill="#264432")
    draw.text((100, 1250), f"{store}  {store_phone}", font=font_text, fill="#264432")
    draw.text((600, 1250), address, font=font_text, fill="#264432")

    file_name = f"{uuid.uuid4().hex}_flyer.png"
    save_path = os.path.join(UPLOAD_DIR, file_name)
    poster.save(save_path)

    return JSONResponse(content={
        "message": "已生成海報",
        "filename": file_name,
        "url": f"https://epson-hey-echo.onrender.com/view-image/{file_name}"
    })

@app.post("/generate_real_flyer_from_talk")
async def generate_flyer_from_talk(request: Request):
    data = await request.json()
    messages = data.get("messages", [])
    image_filename = data.get("image_filename")

    values = {
        "title": "",
        "selling_points": [],
        "area": "",
        "price": "",
        "agent": "",
        "phone": "",
        "store": "",
        "store_phone": "",
        "address": ""
    }

    for msg in messages:
        content = msg.get("content", "")
        if "主標題" in content or "名稱" in content:
            values["title"] = content.split("：")[-1].strip()
        elif "坪數" in content:
            values["area"] = content.split("：")[-1].strip()
        elif "總價" in content:
            values["price"] = content.split("：")[-1].strip()
        elif "聯絡人" in content:
            values["agent"] = content.split("：")[-1].strip()
        elif "電話" in content and "市話" not in content:
            values["phone"] = content.split("：")[-1].strip()
        elif "門市" in content:
            values["store"] = content.split("：")[-1].strip()
        elif "市話" in content:
            values["store_phone"] = content.split("：")[-1].strip()
        elif "地址" in content:
            values["address"] = content.split("：")[-1].strip()
        elif any(keyword in content for keyword in ["機能", "採光", "捷運", "音圖", "優質", "中心佳"]):
            values["selling_points"].append(content.strip())

    while len(values["selling_points"]) < 4:
        values["selling_points"].append("特色")

    payload = {
        "title": values["title"],
        "selling_point1": values["selling_points"][0],
        "selling_point2": values["selling_points"][1],
        "selling_point3": values["selling_points"][2],
        "selling_point4": values["selling_points"][3],
        "area": values["area"],
        "price": values["price"],
        "agent": values["agent"],
        "phone": values["phone"],
        "store": values["store"],
        "store_phone": values["store_phone"],
        "address": values["address"],
        "image_filename": image_filename
    }

    return await generate_real_flyer(**payload)

# ➕ 提供外部觸發產圖功能
@app.post("/multi-dialogue-to-image-realestate")
async def generate_from_multi_dialogue(req: Request):
    data = await req.json()
    messages = data.get("messages", [])
    image_filename = data.get("image_filename")

    # ⬇️ 第一步：先回傳底圖，提醒使用者提供資訊
    poster = PILImage.new("RGB", (1240, 1754), "#264432")
    draw = ImageDraw.Draw(poster)
    draw.rectangle([0, 1315, 1240, 1754], fill="#F8F1D7")
    file_name = f"{uuid.uuid4().hex}_preview.png"
    filepath = os.path.join(UPLOAD_DIR, file_name)
    poster.save(filepath)

    # 建議加 loading 效果或下一步提醒
    preview_url = f"https://epson-hey-echo.onrender.com/view-image/{file_name}"
    followup = {
        "role": "assistant",
        "type": "text",
        "content": "這是基本底圖，請輸入主標題、坪數、總價、聯絡人等資訊，我會幫你合成完整房仲宣傳單喔！"
    }

    return JSONResponse(content={
        "new_messages": [
            {"role": "assistant", "type": "image", "image_url": preview_url},
            followup
        ]
    })
