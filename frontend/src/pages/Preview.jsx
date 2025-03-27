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
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [hasUploaded, setHasUploaded] = useState(false);

  useEffect(() => {
    if (authCode) {
      dispatch(setAuthCode(authCode));
    }
  }, [authCode]);
  const handleAuthCode = () => {
    getAuthCode();
  };
  const handleAccessToken = async () => {
    try {
      const res = await postAccessToken();
      console.log(res);
      // if (res.code === 200) {
      //   showSwal({ isSuccess: true, title: `上傳成功!` });
      //   setPdfUrls(res.pdf_urls);
      // } else {
      //   showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
      // }
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
    if (
      fileType !== "image/png" &&
      fileType !== "image/jpeg" &&
      fileType !== "image/jpg"
    ) {
      showSwal({
        isSuccess: false,
        title: `請上傳PNG或JPEG格式的圖片`,
      });
      return;
    }

    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
    setHasUploaded(true);
  };
  const submitFile = async () => {
    if (!file) return;

    // const formData = new FormData();
    // formData.append("file", file);

    try {
      const res = await postFileUpload(file);
      console.log(res);
      if (res.code === 200) {
        showSwal({ isSuccess: true, title: `上傳成功!` });
      } else {
        showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
      }
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
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
        <BaseButton
          className="w-full m-2"
          label="0_get_auth_code"
          onClick={handleAuthCode}
        />
        <BaseButton
          className="w-full m-2"
          label="1_post_access_token"
          onClick={handleAccessToken}
        />
        <BaseButton
          className="w-full m-2"
          label="2_post_print_job_creation"
          onClick={handlePrintJobCreation}
        />

        {/* <BaseButton
          className="w-full m-2"
          label="3_post_file_upload"
          onClick={handleFileUpload}
        /> */}
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
            defaultValue="abc"
          />
        )}

        <BaseButton
          className="w-full m-2"
          label="4_post_print_execution"
          onClick={handlePrintExecution}
        />
      </div>
    </>
  );
};

export default Preview;
