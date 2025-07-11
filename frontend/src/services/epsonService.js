import axios from "axios";
import { store } from "@/stores/store";
// import { setAccessToken } from "@/stores/features/epsonSlice";

// base url
const epsonAuthUrl = import.meta.env.VITE_EPSON_API_AUTH_URL;
const epsonBaseUrl = import.meta.env.VITE_EPSON_API_BASE_URL;
// client
const clientId = import.meta.env.VITE_EPSON_CLIENT_ID;
const clientSecret = import.meta.env.VITE_EPSON_CLIENT_SECRET;
const redirectUri = import.meta.env.VITE_EPSON_REDIRECT_URI;
const epsonApiKey = import.meta.env.VITE_EPSON_API_KEY;
// authorization
const basicAuth = btoa(`${clientId}:${clientSecret}`); // 編碼為 Base64 格式
// let authCode = "3_bW8IwcI58xeOOJDyZlKHgx1q7qpJZlV9umui-40qA";
let accessToken = "";
let refreshToken = "";
console.log(refreshToken);
let destinationId = "";
let productName = "";
let jobId = "";
let uploadUri = "";
// let uploadUri = https://upload.epsonconnect.com/data?Key=91ef4affb385e54f999dbc11714e3711cd161d57394ea31aee1c521b81c796c4&File=https://epson-hey-echo.onrender.com/view-pdf/4234264fd91f4666a73735a534834e1e_topLeft.pdf;

// 0 authorization code
export const getAuthCode = async () => {
  // return await axios.get(
  //   `${epsonAuthUrl}/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=device`
  // );
  // window.open(
  //   `${epsonAuthUrl}/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=device`
  // );
  window.location.href = `${epsonAuthUrl}/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=device`;
};

// 1 access token
export const postAccessToken = async () => {
  const authCode = store.getState().epson.authCode;
  console.log(authCode);
  return await axios
    .post(
      `${epsonAuthUrl}/auth/token`,
      {
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: basicAuth,
        },
      }
    )
    .then((res) => {
      console.log(res.data);
      accessToken = res.data.access_token;
      refreshToken = res.data.refresh_token;
      // const accessToken = res.data.access_token;
      // const refreshToken = res.data.refresh_token;
      // store.dispatch(setAccessToken(accessToken));
      // store.dispatch(setRefreshToken(refreshToken));
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};

// 1.5 get device info
export const getDeviceInfo = async () => {
  return await axios
    .get(`${epsonBaseUrl}/api/2/printing/devices/info`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-api-key": epsonApiKey,
      },
    })
    .then((res) => {
      console.log(res.data);
      productName = res.data.productName;
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};

// 2 print job creation
export const postPrintJobCreation = async () => {
  let borderless = false;
  if (productName === "L6290") {
    borderless = true;
  } else if (productName === "L6490") {
    borderless = false;
  }

  const printSettings = {
    paperSize: "ps_a4",
    paperType: "pt_plainpaper",
    borderless,
    printQuality: "high",
    paperSource: "auto",
    colorMode: "color",
  };

  return await axios
    .post(
      `${epsonBaseUrl}/api/2/printing/jobs`,
      {
        jobName: "JobName01",
        // "printMode": "document",
        printMode: "photo",
        printSettings,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": epsonApiKey,
        },
      }
    )
    .then((res) => {
      console.log(res.data);
      jobId = res.data.jobId;
      uploadUri = res.data.uploadUri;
      // const jobId = res.data.jobId;
      // const uploadUri = res.data.uploadUri;
      // store.dispatch(setJobId(jobId));
      // store.dispatch(setUploadUri(uploadUri));
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};

// 3 file upload
export const postFileUpload = async (file) => {
  if (!file) {
    return { code: 400, msg: "No file provided" };
  }
  console.log(file);
  // const suffix = file.name.split(".").pop();
  const suffix = file.type.split("/")[1]; // 取得副檔名
  return await axios
    .post(`${uploadUri}&File=1.${suffix}`, file, {
      headers: {
        "Content-Type": file.type,
      },
    })
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
  // try {
  //   const fileResponse = await axios.get(fileUrl, { responseType: "blob" });
  //   const formData = new FormData();
  //   formData.append("file", fileResponse.data, "uploaded.pdf");

  //   const response = await axios.post(uploadUri, formData, {
  //     headers: { "Content-Type": "multipart/form-data" },
  //   });

  //   console.log(response.data);
  //   return response.data;
  // } catch (error) {
  //   return { code: 500, redirectUrl: "/login", msg: error.message };
  // }
};

// 4 print execution
export const postPrintExecution = async () => {
  return await axios
    .post(
      `${epsonBaseUrl}/api/2/printing/jobs/${jobId}/print`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": epsonApiKey,
        },
      }
    )
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};

// 5 post scan destination
export const postScanDestination = async (email) => {
  return await axios
    .post(
      `${epsonBaseUrl}/api/2/scanning/destinations`,
      {
        aliasName: "JobName01",
        destinationService: "mail",
        destination: email,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": epsonApiKey,
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      console.log(res.data);
      destinationId = res.data.destinationId;
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};

// 6 delete scan destination
export const deleteScanDestination = async () => {
  return await axios
    .delete(`${epsonBaseUrl}/api/2/scanning/destinations/${destinationId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "x-api-key": epsonApiKey,
      },
    })
    .then((res) => {
      console.log(res.data);
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};
