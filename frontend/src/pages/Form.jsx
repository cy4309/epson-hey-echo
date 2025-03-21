import { useState, useRef } from "react";
import BaseButton from "@/components/BaseButton";
import { uploadImage } from "@/services/formService";

const Form = () => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [hasUploaded, setHasUploaded] = useState(false);
  // const [isConversation, setIsConversation] = useState(false);

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
      alert("只支援 PNG、JPG、JPEG 格式");
      return;
    }

    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
    setHasUploaded(true);
  };

  const submitFile = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await uploadImage(formData);
      console.log(res);
      if (res.code === 200) {
        alert("上傳成功");
      } else {
        alert("上傳失敗，請稍後再試");
      }
    } catch (err) {
      console.error(err);
      alert("上傳失敗，請稍後再試");
    }
  };

  return (
    <>
      {/* {isConversation && ( */}
      <>
        {filePreview && (
          <div className="w-1/2 h-1/2 flex justify-center items-center rounded-lg">
            <img
              className="w-full h-full rounded-lg object-contain"
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
            className="w-2/3 m-4 rounded-full"
          ></BaseButton>
        ) : (
          <div className="w-2/3">
            <button
              className="w-12 h-12 m-4 bg-primaryColorGray rounded-full flex justify-center items-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {/* <FontAwesomeIcon icon={faImage} className="text-xl" /> */}
            </button>
          </div>
        )}
        {filePreview && (
          <BaseButton
            label="送出圖片"
            onClick={submitFile}
            className="w-2/3 m-4"
          />
        )}
      </>
      {/* )} */}
    </>
  );
};

export default Form;
