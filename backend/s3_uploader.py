import requests
import os
#https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/xxx.pdf
def upload_image_to_epsondest(filepath: str, fileName: str):
    url = "https://imorph.spe3d.co/api/UploadEpson"
    headers = { 
        "Authorization": "b1f7690c-ad05-4416-8c42-72df5c38fae2"
    }
    with open(filepath, "rb") as f:
        suffix = os.path.splitext(fileName)[-1].replace(".", "")  # 取副檔名
        files = {
            "file": (fileName, f,"image/png"),  
            "filename": (None, fileName),
            "suffix": (None, f".{suffix}")
        }
        print("[INFO] Epson 上傳檔案:", fileName)
        print("[INFO] Epson 上傳路徑:", filepath)
        print("[INFO] Epson 上傳網址:", url)
        print("[INFO] 檔案後綴名:", suffix)
        print("[DEBUG] 檔案大小:", os.path.getsize(filepath), "bytes")
        print("[DEBUG] Status Code:", response.status_code)
        print("[DEBUG] Response Headers:", response.headers)
        print("[DEBUG] Raw Response Text:", response.text)

        response = requests.post(url, headers=headers, files=files)
        try:
            result = response.json()
            print("[DEBUG] Epson 回應:", result)
        except Exception as e:
                print("[ERROR] Epson 上傳過程錯誤:", e)
                return 500, None
        
        if result.get("Code") != 10000:
                    print("[ERROR] Epson 回傳錯誤:", result)
                    return 400, None
        print("[WARN] Epson 回傳 null，使用自組 filename:", fileName)
        return 200, fileName  
