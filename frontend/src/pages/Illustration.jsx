import { useState, useRef } from "react";
import BaseButton from "@/components/BaseButton";
import {
  uploadImage,
  generateMultiplePdfs,
} from "@/services/illustrateService";
import { showSwal } from "@/utils/notification";
import { Input } from "antd";

const Illustration = () => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [hasUploaded, setHasUploaded] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [textContent, setTextContent] = useState("abc");
  const [fontSize, setFontSize] = useState(18);
  const [imgUrls, setImgUrls] = useState([]); //Joyce test
  const handleFileUpload = (e) => {
    // const file = e.target.files?.[0];
    // if (!file) return;
    // const reader = new FileReader();
    // reader.readAsDataURL(file);
    // reader.onload = () => {
    //   setFilePreview(reader.result);
    //   setHasUploaded(true);
    // };
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(selectedFile.type)) {
      showSwal(false, "只支援 PNG、JPG、JPEG 格式");
      return;
    }

    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
    setHasUploaded(true);
  };

  const submitImg = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadImage(formData);
      console.log(res);
      if (res.code === 200) {
        showSwal({ isSuccess: true, title: `上傳成功!` });
        setIsUploaded(true);
        setFileName(res.filename);
      } else {
        showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
      }
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };

  const submitFile = async () => {
    if (!textContent || !fontSize) {
      showSwal({ isSuccess: false, title: `請輸入文字內容和字體大小` });
      return;
    }
    const payload = {
      image_filename: fileName,
      content: textContent,
      font_size: fontSize,
    };
    console.log(payload);

    try {
      const res = await generateMultiplePdfs(payload);
      console.log(res);
      if (res.code === 200) {
        showSwal({ isSuccess: true, title: `上傳成功!` });
        setImgUrls(res.img_urls);
      } else {
        showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
      }
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };

  return (
    <>
      {filePreview && (
        <div className="w-1/2 h-1/2 flex justify-center items-center rounded-xl">
          <img
            className="w-full h-full rounded-xl object-contain"
            src={filePreview}
            alt="preview"
          />
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept=".png, .jpg, .jpeg"
        className="hidden"
        onChange={handleFileUpload}
      />
      {!hasUploaded ? (
        <BaseButton
          label="上傳圖片"
          onClick={() => fileInputRef.current?.click()}
          className="w-2/3 m-4 rounded-xl"
        ></BaseButton>
      ) : (
        <div className="w-2/3">
          <button
            className="w-12 h-12 m-4 bg-primaryColorGray rounded-xl flex justify-center items-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {/* <FontAwesomeIcon icon={faImage} className="text-xl" /> */}
          </button>
        </div>
      )}
      {filePreview && !isUploaded && (
        <BaseButton
          label="送出圖片"
          onClick={submitImg}
          className="w-2/3 m-4"
          defaultValue="abc"
        />
      )}
      {isUploaded && (
        <>
          <Input
            name="text"
            placeholder="輸入文字內容"
            className="m-2"
            size="large"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />
          <Input
            name="text"
            placeholder="字體大小"
            className="m-2"
            size="large"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
          <BaseButton className="m-2" label="送出" onClick={submitFile} />
          {/* <BaseButton className="m-2" label="列印" onClick={submitPrint} /> */}
        </>
      )}
      {imgUrls.length > 0 && (
        <div className="gap-6 flex justify-center items-center scale-75">
          {imgUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              className="h-[400px] rounded-xl shadow"
              // title={`pdf-preview-${index}`}
            />
            // <iframe
            //   key={index}
            //   src={`${import.meta.env.VITE_BACKEND_API_BASE_URL}${url}`}
            //   className="h-[400px] rounded-xl shadow"
            //   // title={`pdf-preview-${index}`}
            // />
          ))}
        </div>
      )}
    </>
  );
};

export default Illustration;
