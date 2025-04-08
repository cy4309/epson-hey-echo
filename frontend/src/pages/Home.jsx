import { useState, useRef } from "react";
import { Input, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import {
  CheckOutlined,
  FormOutlined,
  // AreaChartOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
// import LoadingIndicator from "@/components/LoadingIndicator";
import { showSwal } from "@/utils/notification";
import { generateDialogueToImage } from "@/services/generateService";
import { uploadImage } from "@/services/illustrateService";

const Chatbot = () => {
  const navigate = useNavigate();
  // const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGenerationCompleted, setIsGenerationCompleted] = useState(false);
  const { TextArea } = Input;
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");

  const handleSendDialog = async () => {
    if (!input.trim()) return;

    const newUserMsg = { role: "user", type: "text", content: input };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await generateDialogueToImage(updatedMessages);
      console.log(res);
      const newMessages = res.new_messages || [];
      setMessages((prev) => [...prev, ...newMessages]);
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `對話失敗，請稍後再試!` });
    } finally {
      setLoading(false);
    }

    if (!file) return;
    if (file) {
      submitFileUpload();
    }
  };

  const submitFileUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await uploadImage(formData);
      console.log(res);
      if (res.code === 200) {
        showSwal({ isSuccess: true, title: `上傳成功!` });
        // setIsUploaded(true);
        // setFileName(res.filename);
      } else {
        showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
      }
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    // console.log(selectedFile);
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(selectedFile.type)) {
      showSwal(false, "只支援 PNG、JPG、JPEG 格式");
      return;
    }

    setFile(selectedFile);
    const previewUrl = URL.createObjectURL(selectedFile);
    setFilePreview(previewUrl);
    // setInput((prev) => `${prev}\n![圖片描述](${previewUrl})`);
    // setHasUploaded(true);
  };

  // if (isLoading) {
  //   return <LoadingIndicator />;
  // }
  return (
    <>
      {!isGenerationCompleted && (
        <div className="p-4 w-full max-w-xl mx-auto border rounded-lg">
          <aside>
            <h2 className="mb-4 text-xl font-semibold text-center">
              AI 設計師 · 對話式生圖
            </h2>

            <div className="mb-4 flex justify-center items-center">
              <BaseButton
                className="ml-2"
                onClick={() => window.location.reload()}
              >
                <FormOutlined />
                <span className="ml-2">New</span>
              </BaseButton>
              <BaseButton
                className="ml-2"
                onClick={() => setIsGenerationCompleted((prev) => !prev)}
              >
                <CheckOutlined />
                <span className="ml-2">Done</span>
              </BaseButton>
            </div>
          </aside>

          <div className="mb-2 p-2 h-[400px] overflow-y-auto border bg-white rounded">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                {msg.type === "text" && (
                  <div
                    className={`px-2 py-2 inline-block rounded-lg ${
                      msg.role === "user" ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    {msg.content}
                  </div>
                )}
                {msg.type === "image" && (
                  <div className="mt-2">
                    <img
                      src={msg.image_url}
                      alt="AI 圖片"
                      className="max-w-full rounded shadow"
                    />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <Spin tip="生成中...">
                <div style={{ minHeight: 40 }}></div>
              </Spin>
              // <LoadingIndicator />
            )}
          </div>
          <div className="mb-2 w-full flex justify-start items-center">
            {filePreview && (
              <img
                src={filePreview}
                alt="預覽圖片"
                className="mr-2 w-16 rounded-lg shadow"
              />
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept=".png, .jpg, .jpeg, .pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <BaseButton
              className="w-4"
              onClick={() => fileInputRef.current?.click()}
            >
              {/* <AreaChartOutlined /> */}
              <PlusOutlined />
              {/* <span className="ml-2">Upload</span> */}
            </BaseButton>
          </div>
          <TextArea
            rows={3}
            placeholder="描述你想要的畫面，可以繼續補充喔！"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendDialog();
              }
            }}
          />

          <div className="mt-2 text-center">
            <BaseButton
              onClick={handleSendDialog}
              disabled={loading || !input.trim()}
            >
              {loading ? "生成中..." : "送出訊息"}
            </BaseButton>
          </div>
        </div>
      )}

      {isGenerationCompleted && (
        <div className="w-full flex flex-col justify-center items-center">
          <BaseButton
            className="mx-2"
            onClick={() => setIsGenerationCompleted((prev) => !prev)}
          >
            <ArrowLeftOutlined />
            <span className="ml-2">返回</span>
          </BaseButton>
          <BaseButton
            label="排版"
            className="mx-2 w-full"
            onClick={() => navigate("/illustration")}
          />
          <BaseButton
            label="列印"
            className="mx-2 w-full"
            onClick={() => navigate("/print")}
          />
        </div>
      )}
    </>
  );
};

export default Chatbot;
