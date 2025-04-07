import requests

def upload_to_epsondest(filepath: str, filename: str):
    url = "https://imorph.spe3d.co/api/UploadEpson"
    headers = {
        "Authorization": "b1f7690c-ad05-4416-8c42-72df5c38fae2"
    }

    files = {
        "file": (filename, open(filepath, "rb")),
        "fileName": (None, filename),
        "suffix": (None, f".{filename.split('.')[-1]}")
    }

    response = requests.post(url, headers=headers, files=files)
    try:
        result = response.json()
    except Exception as e:
        print("[ERROR] Epson 回傳非 JSON:", response.text)
        return None
    if result.get("Code") != 10000 or not result.get("Data") or result.get("Data") == "null":
        print("[ERROR] Epson API 回傳錯誤或空資料:", result)
        return None

    return result["Data"]  
