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
    return response.status_code, response.text
