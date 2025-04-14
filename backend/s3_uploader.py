import requests
import os
#https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/xxx.pdf
def upload_image_to_epsondest(filepath: str, fileName: str):
    url = "https://imorph.spe3d.co/api/UploadEpson"
    suffix = os.path.splitext(fileName)[-1].lower().replace(".", "")
    base_name = os.path.splitext(fileName)[0]
    
    #測試權限用
    headers = { 
        "Authorization": "b1f7690c-ad05-4416-8c42-72df5c38fae2"
    }
    try:
        with open(filepath, "rb") as f:
            files = {
                "file": (fileName, f, "image/png")
            }
            data = {
                "fileName": base_name,
                "suffix": f".{suffix}"
            }

            print("[INFO] Epson 上傳檔案:", fileName)
            print("[INFO] Epson 上傳路徑:", filepath)
            print("[INFO] Epson 上傳網址:", url)
            print("[INFO] 檔案後綴名:", suffix)
            print("[DEBUG] 檔案大小:", os.path.getsize(filepath), "bytes")

            response = requests.post(url, headers=headers, files=files, data=data)

        print("[DEBUG] Status Code:", response.status_code)
        print("[DEBUG] Raw Response Text:", response.text)

        result = response.json()
        print("[DEBUG] Epson 回應:", result)

        if result.get("Code") != 10000:
            print("[ERROR] Epson 回傳錯誤:", result)
            return 400, None

        if not result.get("Data") or result.get("Data") == "null":
            fallback_url = f"https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/{fileName}"
            print("[WARN] Epson 回傳 null，使用 fallback URL:", fallback_url)
            return 200, fallback_url

        return 200, result.get("Data")

    except Exception as e:
        print("[ERROR] Epson 上傳過程錯誤:", e)
        return 500, None
