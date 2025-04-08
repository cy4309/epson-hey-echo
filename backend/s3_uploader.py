import requests
import os

def upload_image_to_epsondest(filepath: str, filename: str):
    url = "https://imorph.spe3d.co/api/UploadEpson"
    headers = { 
        "Authorization": "b1f7690c-ad05-4416-8c42-72df5c38fae2"
    }
    with open(filepath, "rb") as f:
        # filename_only = "upload.pdf"
        suffix = os.path.splitext(filename)[-1]  # 取副檔名
        files = {
            # "file": (filename, open(filepath, "rb")),
            "file": (filename, f),
            "fileName": (None, filename),
            "suffix": (None, suffix)
        }
        print("[INFO] Epson 上傳檔案:", filename)
        print("[INFO] Epson 上傳路徑:", filepath)
        print("[INFO] Epson 上傳網址:", url)
        print("[INFO] 檔案後綴名:", suffix)
        print("[DEBUG] 檔案大小:", os.path.getsize(filepath), "bytes")

        response = requests.post(url, headers=headers, files=files)
        try:
            result = response.json()
        except Exception as e:
                print("[ERROR] Epson 上傳過程錯誤:", e)
                return 500, {"error": str(e)}
        
        if result.get("Code") != 10000 or not result.get("Data") or result.get("Data") == "null":
                print("[ERROR] Epson API 回傳錯誤或空資料:", result)
                return 400, result

        return 200, result["Data"]  
