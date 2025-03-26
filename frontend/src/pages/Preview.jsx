import { useEffect } from "react";
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

const Preview = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const authCode = params.get("code");

  useEffect(() => {
    if (authCode) {
      // 還需把authCode傳進redux
      console.log(authCode);
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
  const handleFileUpload = async () => {
    const fileUrl =
      "https://epson-hey-echo.onrender.com/view-pdf/4234264fd91f4666a73735a534834e1e_topLeft.pdf";
    try {
      const res = await postFileUpload(fileUrl);
      console.log(res);
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
        <BaseButton
          className="w-full m-2"
          label="3_post_file_upload"
          onClick={handleFileUpload}
        />
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
