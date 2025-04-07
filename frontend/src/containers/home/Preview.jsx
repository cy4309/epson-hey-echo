import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import BaseButton from "@/components/BaseButton";
import { showSwal } from "@/utils/notification";
import {
  getAuthCode,
  postAccessToken,
  postPrintJobCreation,
  postFileUpload,
  postPrintExecution,
} from "@/services/epsonService";
import { useDispatch } from "react-redux";
import { setAuthCode } from "@/stores/features/epsonSlice";

const Preview = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const params = new URLSearchParams(location.search);
  const authCode = params.get("code");
  const fileInputRef = useRef(null);
  // const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");

  useEffect(() => {
    if (authCode) {
      console.log("Authorization code detected:", authCode);
      dispatch(setAuthCode(authCode));

      // 從 localStorage 恢復文件預覽
      const storedFile = localStorage.getItem("uploadedFile");
      if (storedFile) {
        setFilePreview(storedFile);
      }

      executePrint(); // 導回來後繼續執行後續步驟
    }
  }, [authCode]);

  const executePrint = async () => {
    try {
      // Step 1: Handle Auth Code
      console.log("Step 1: Getting Auth Code...");
      if (!authCode) {
        handleAuthCode();
        return;
      }

      // Step 2: Post Access Token
      console.log("Step 2: Posting Access Token...");
      await handleAccessToken();

      // Step 3: Create Print Job
      console.log("Step 3: Creating Print Job...");
      await handlePrintJobCreation();

      // Step 4: Upload File
      console.log("Step 4: Uploading File...");
      await submitFile();

      // Step 5: Execute Print
      console.log("Step 5: Executing Print...");
      await handlePrintExecution();

      // Success
      console.log("Print process completed successfully!");
      showSwal({ isSuccess: true, title: "列印成功!" });
    } catch (err) {
      console.error("Error during print process:", err);
      showSwal({ isSuccess: false, title: "列印失敗，請稍後再試!" });
    }
  };

  const handleAuthCode = () => {
    getAuthCode();
  };
  const handleAccessToken = async () => {
    try {
      const res = await postAccessToken();
      console.log(res);
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };
  const handlePrintJobCreation = async () => {
    try {
      const res = await postPrintJobCreation();
      console.log(res);
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };
  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const fileType = selectedFile.type;
    const fileName = selectedFile.name;

    if (fileType.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64File = reader.result;
        localStorage.setItem("uploadedFile", base64File);
        localStorage.setItem("uploadedFileName", fileName);
        localStorage.setItem("uploadedFileType", fileType);
        // setFile(selectedFile);
        setFilePreview(URL.createObjectURL(selectedFile));
      };
      reader.readAsDataURL(selectedFile);
    } else if (fileType === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        const base64File = reader.result;
        localStorage.setItem("uploadedFile", base64File);
        localStorage.setItem("uploadedFileName", fileName);
        localStorage.setItem("uploadedFileType", fileType);
        // setFile(selectedFile);
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      showSwal({ isSuccess: false, title: "不支援的文件類型!" });
    }
    // setFile(selectedFile);
    // setFilePreview(URL.createObjectURL(selectedFile));
  };
  const submitFile = async () => {
    // if (!file) return;
    // 從 localStorage 獲取文件數據
    const base64File = localStorage.getItem("uploadedFile");
    const fileName = localStorage.getItem("uploadedFileName");
    const fileType = localStorage.getItem("uploadedFileType");

    if (!base64File || !fileName || !fileType) {
      showSwal({ isSuccess: false, title: "請先上傳圖片!" });
      return;
    }

    try {
      // const base64File = localStorage.getItem("uploadedFile");
      // const binaryFile = base64ToBinary(base64File, file.name, file.type);
      const binaryFile = base64ToBinary(base64File, fileName, fileType);

      const res = await postFileUpload(binaryFile);
      console.log(res);
      if (res.status === 200) {
        showSwal({ isSuccess: true, title: `上傳成功!` });
        localStorage.removeItem("uploadedFile");
        localStorage.removeItem("uploadedFileName");
        localStorage.removeItem("uploadedFileType");
      } else {
        showSwal({ isSuccess: false, title: `上傳失敗，請重新上傳!` });
        localStorage.removeItem("uploadedFile");
        localStorage.removeItem("uploadedFileName");
        localStorage.removeItem("uploadedFileType");
      }
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };
  const base64ToBinary = (base64, fileName, mimeType) => {
    const binaryString = atob(base64.split(",")[1]); // 去掉 Base64 前綴
    const binaryLength = binaryString.length;
    const binaryArray = new Uint8Array(binaryLength);
    for (let i = 0; i < binaryLength; i++) {
      binaryArray[i] = binaryString.charCodeAt(i);
    }
    return new File([binaryArray], fileName, { type: mimeType });
  };
  const handlePrintExecution = async () => {
    try {
      const res = await postPrintExecution();
      console.log(res);
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };

  return (
    <>
      <div className="w-full flex flex-wrap justify-center items-center">
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
          accept=".png, .jpg, .jpeg, .pdf"
          className="hidden"
          onChange={handleFileUpload}
        />
        {!filePreview ? (
          <BaseButton
            label="上傳圖片"
            onClick={() => fileInputRef.current?.click()}
            className="w-full m-4 rounded-full"
          />
        ) : (
          <BaseButton
            label="重新上傳圖片"
            onClick={() => fileInputRef.current?.click()}
            className="w-full m-4 rounded-full"
          />
        )}
        {filePreview && (
          <BaseButton
            label="執行列印"
            className="w-full m-2"
            onClick={executePrint}
          />
        )}
        {/* <BaseButton
          className="w-full m-2"
          label="0_get_auth_code"
          onClick={handleAuthCode}
        /> */}
        {/* <BaseButton
          className="w-full m-2"
          label="1_post_access_token"
          onClick={handleAccessToken}
        /> */}
        {/* <BaseButton
          className="w-full m-2"
          label="2_post_print_job_creation"
          onClick={handlePrintJobCreation}
        /> */}
        {/* {filePreview && (
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
            ></button>
          </div>
        )}
        {filePreview && (
          <BaseButton
            label="送出圖片"
            onClick={submitFile}
            className="w-2/3 m-4"
            defaultValue="abc"
          />
        )} */}
        {/* <BaseButton
          className="w-full m-2"
          label="4_post_print_execution"
          onClick={handlePrintExecution}
        /> */}
      </div>
    </>
  );
};

export default Preview;
