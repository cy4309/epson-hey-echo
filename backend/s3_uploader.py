import requests

def upload_to_epsondest(filepath: str, filename: str):
    url = "https://imorph.spe3d.co/api/UploadEpson"
    headers = {
        "Authorization": "b1f7690c-ad05-4416-8c42-72df5c38fae2"
    }
    with open(filepath, "rb") as f:
        files = {
            # "file": (filename, open(filepath, "rb")),
            "file": (filename, f),
            "fileName": (None, filename),
            "suffix": (None, f".{filename.split('.')[-1]}")
        }

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
