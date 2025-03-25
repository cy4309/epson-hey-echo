import axios from "axios";
// base url
const epsonAuthUrl = import.meta.env.VITE_EPSON_API_AUTH_URL;
const epsonBaseUrl = import.meta.env.VITE_EPSON_API_BASE_URL;
const epsonUploadUrl = import.meta.env.VITE_EPSON_API_UPLOAD_URL;
// client
const clientId = import.meta.env.VITE_EPSON_CLIENT_ID;
const clientSecret = import.meta.env.VITE_EPSON_CLIENT_SECRET;
const redirectUri = import.meta.env.VITE_EPSON_REDIRECT_URI;
const epsonApiKey = import.meta.env.VITE_EPSON_API_KEY;
// authorization
const basicAuth = btoa(`${clientId}:${clientSecret}`); // 編碼為 Base64 格式
let authCode = "";
let accessToken = "";
// let refreshToken = "";
// response data
let jobId = "";
let uploadUri = "";

// 0 authorization code
export const getAuthCode = async () => {
  // return await axios.get(
  //   `${epsonAuthUrl}/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=device`
  // );
  window.open(
    `${epsonAuthUrl}/auth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=device`
  );
};

// 1 access token
export const postAccessToken = async () => {
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
      console.log(res);
      accessToken = res.data.access_token;
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};

// 2 print job creation
export const postPrintJobCreation = async () => {
  return await axios
    .get(
      `${epsonBaseUrl}/api/2/printing/jobs`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": epsonApiKey,
        },
      },
      {
        jobName: "JobName01",
        printMode: "document",
        colorModes: "color",
        paperSizes: [
          {
            paperSize: "ps_a4",
            paperTypes: [
              {
                paperType: "pt_plainpaper",
                borderless: true,
                paperSources: ["rear"],
                printQualities: "normal",
                doubleSided: false,
              },
            ],
          },
        ],
      }
    )
    .then((res) => {
      console.log(res);
      jobId = res.data.jobId;
      uploadUri = res.data.uploadUri;
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};

// 3 file upload
export const postFileUpload = async () => {
  return await axios
    .post(
      `${epsonUploadUrl}&File=1.pdf`,
      {
        fileName: "test.pdf",
        fileType: "application/pdf",
        fileSize: 123456,
        filePath: "/path/to/file.pdf",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": epsonApiKey,
        },
      }
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};

// 4 print execution
export const postPrintExecution = async () => {
  return await axios
    .post(
      `${epsonBaseUrl}/api/2/printing/jobs/${jobId}/execute`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "x-api-key": epsonApiKey,
        },
      }
    )
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return { code: 500, redirectUrl: "/login", msg: err };
    });
};
