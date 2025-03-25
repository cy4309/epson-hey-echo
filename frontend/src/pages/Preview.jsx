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
  const handlePrint = () => {
    getAuthCode();
    // window.open(
    //   `${
    //     import.meta.env.VITE_EPSON_API_AUTH_URL
    //   }/auth/authorize?response_type=code&client_id=${
    //     import.meta.env.VITE_EPSON_CLIENT_ID
    //   }&redirect_uri=${import.meta.env.VITE_EPSON_REDIRECT_URI}&scope=device`
    // );
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
    try {
      const res = await postFileUpload();
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
      <BaseButton className="m-2" label="get_auth_code" onClick={handlePrint} />
      <BaseButton
        className="m-2"
        label="post_access_token"
        onClick={handleAccessToken}
      />
      <BaseButton
        className="m-2"
        label="post_print_job_creation"
        onClick={handlePrintJobCreation}
      />
      <BaseButton
        className="m-2"
        label="post_file_upload"
        onClick={handleFileUpload}
      />
      <BaseButton
        className="m-2"
        label="post_print_execution"
        onClick={handlePrintExecution}
      />
    </>
  );
};

export default Preview;
