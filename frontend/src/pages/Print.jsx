import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import BaseButton from "@/components/BaseButton";
import { showSwal } from "@/utils/notification";
import {
  getAuthCode,
  postAccessToken,
  getDeviceInfo,
  postPrintJobCreation,
  postFileUpload,
  postPrintExecution,
} from "@/services/epsonService";
import { useDispatch } from "react-redux";
import { setAuthCode } from "@/stores/features/epsonSlice";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";

const Print = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = new URLSearchParams(location.search);
  const authCode = params.get("code");
  // const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const { imgUrlToPrint } = location.state || {};
  const fileInputRef = useRef(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const s3AuthCode = import.meta.env.VITE_S3_AUTH_CODE;

  useEffect(() => {
    if (imgUrlToPrint) {
      console.log("Image URL to print:", imgUrlToPrint);
      convertImageToBase64(imgUrlToPrint);
    }
  }, [imgUrlToPrint]);

  useEffect(() => {
    const scanEmail = localStorage.getItem("epson_scan_email");

    if (authCode) {
      console.log("Authorization code detected:", authCode);
      dispatch(setAuthCode(authCode));

      if (scanEmail) {
        // 如果是從掃描頁來的
        navigate("/scan");
        return;
      }

      // 從 localStorage 恢復文件預覽
      const storedFile = localStorage.getItem("uploadedFile");
      if (storedFile) {
        setFilePreview(storedFile);
      }

      executePrint(); // 導回來後繼續執行後續步驟
    }
  }, [authCode]);

  const convertImageToBase64 = (url) => {
    if (url.includes("s3")) {
      url = `${url}?token=${encodeURIComponent(`Bearer ${s3AuthCode}`)}`;
    }
    const fileName = url.substring(
      url.lastIndexOf("/") + 1,
      url.lastIndexOf(".")
    );
    // const mimeType = url.substring(url.lastIndexOf(".") + 1);
    const mimeType = url.substring(url.lastIndexOf(".") + 1).split("?")[0];
    localStorage.setItem("uploadedFileName", fileName);
    localStorage.setItem("uploadedFileType", `image/${mimeType}`);

    const img = new Image();
    img.crossOrigin = "anonymous"; // 設置跨域
    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL(`image/${mimeType}`); // 將圖片轉換為 Base64
      localStorage.setItem("uploadedFile", base64);
      setFilePreview(base64);
    };
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

      // Step 2.5: Get Device Info
      console.log("Step 2.5: Getting Device Info...");
      await handleDeviceInfo();

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
      setIsPrinting(true);
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
  const handleDeviceInfo = async () => {
    try {
      const res = await getDeviceInfo();
      console.log(res);
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `取得失敗，請稍後再試!` });
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
        showSwal({ isSuccess: false, title: `上傳失敗，請重新執行!` });
        // localStorage.removeItem("uploadedFile");
        // localStorage.removeItem("uploadedFileName");
        // localStorage.removeItem("uploadedFileType");
      }
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `執行失敗，請稍後再試!` });
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

  if (!filePreview) {
    return (
      <div className="p-4 w-full h-full max-w-4xl mx-auto border rounded-xl flex flex-col justify-center items-center">
        <span>沒有可用的圖片，請上傳圖片或重新生成。</span>
        <div className="my-4 w-full flex justify-center items-center">
          <BaseButton
            className="w-full mx-2"
            onClick={() => navigate("/login")}
          >
            <ArrowLeftOutlined />
            <span className="ml-2">回首頁</span>
          </BaseButton>

          <input
            type="file"
            ref={fileInputRef}
            accept=".png, .jpg, .jpeg, .pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
          {!filePreview ? (
            <BaseButton
              onClick={() => fileInputRef.current?.click()}
              className="w-full m-4 rounded-xl"
            >
              <AreaChartOutlined />
              <span className="ml-2">上傳照片</span>
            </BaseButton>
          ) : (
            <BaseButton
              label="重新上傳圖片"
              onClick={() => fileInputRef.current?.click()}
              className="w-full m-4 rounded-xl"
            >
              <AreaChartOutlined />
              <span className="ml-2">重新上傳</span>
            </BaseButton>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <div className="w-full flex flex-wrap justify-center items-center"> */}
      <div className="p-4 w-full h-full max-w-4xl mx-auto border rounded-xl flex flex-col justify-center items-center">
        {filePreview && !isPrinting && (
          <>
            <img
              className="m-4 w-full h-full rounded-xl object-contain"
              src={filePreview}
              alt="preview"
            />
            <div className="w-full h-full flex justify-center items-center">
              <BaseButton
                className="w-1/2 mx-2 !px-0"
                onClick={() => navigate(-1)}
              >
                <ArrowLeftOutlined />
                <span className="ml-2">回主頁</span>
              </BaseButton>
              <BaseButton className="w-full mx-2" onClick={executePrint}>
                <span className="mr-2">執行列印</span>
                <ArrowRightOutlined />
              </BaseButton>
            </div>
          </>
        )}
        {isPrinting && (
          <>
            <img
              className="m-4 w-full h-full rounded-xl object-contain"
              src={filePreview}
              alt="preview"
            />
            <div className="w-full h-full flex justify-center items-center">
              <BaseButton
                className="w-full mx-2"
                onClick={() => {
                  localStorage.removeItem("userName");
                  showSwal({ isSuccess: true, title: "See you!" });
                  navigate("/login");
                }}
              >
                <span className="mr-2">回首頁</span>
                <ArrowRightOutlined />
              </BaseButton>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Print;
