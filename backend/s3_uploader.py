import requests
import os
#https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/xxx.pdf
def upload_image_to_epsondest(filepath: str, fileName: str):
    url = "https://imorph.spe3d.co/api/UploadEpson"
    
    #測試權限用
    headers = { 
        "Authorization": "b1f7690c-ad05-4416-8c42-72df5c38fae2",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"  # 模擬瀏覽器
    }
    s3_path = f"https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/{fileName}"
    with open(filepath, "rb") as f:
        suffix = os.path.splitext(fileName)[-1].replace(".", "")  # 取副檔名
        files = {
            "file": (fileName, f,"image/png"),  
            "fileName": (None, fileName),
            "suffix": (None, f".{suffix}")
        }
        print("[INFO] Epson 上傳檔案:", fileName)
        print("[INFO] Epson 上傳路徑:", filepath)
        print("[INFO] Epson 上傳網址:", url)
        print("[INFO] 檔案後綴名:", suffix)
        print("[DEBUG] 檔案大小:", os.path.getsize(filepath), "bytes")

        response = requests.post(url, headers=headers, files=files)
        
        print("[DEBUG] Status Code:", response.status_code)
        print("[DEBUG] Response Headers:", response.headers)
        print("[DEBUG] Raw Response Text:", response.text)
        
        try:
            result = response.json()
            print("[DEBUG] Epson 回應:", result)
            
            if result.get("Code") != 10000:
                print("[ERROR] Epson 回傳錯誤:", result)
                return 400, None
            if not result.get("Data"):
                print("[ERROR] Epson 回傳成功但 Data 為 null，請檢查是否真的有上傳")
                return 200, f"https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/{fileName}"
            return 200, result.get("Data")
        except Exception as e:
                print("[ERROR] Epson 上傳過程錯誤:", e)
                return 500, None
