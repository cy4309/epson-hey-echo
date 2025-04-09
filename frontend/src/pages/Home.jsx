import { useState, useRef, useEffect } from "react";
import { Input } from "antd";
import { useNavigate } from "react-router-dom";
import {
  CheckOutlined,
  FormOutlined,
  CloseCircleOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import { showSwal } from "@/utils/notification";
import { generateDialogueToImage } from "@/services/generateService";
import { uploadImage } from "@/services/illustrateService";
const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL;

const Chatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [textAreaValue, setTextAreaValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerationCompleted, setIsGenerationCompleted] = useState(false);
  const { TextArea } = Input;
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [imageSelectedToPrint, setImageSelectedToPrint] = useState("");
  console.log(imageSelectedToPrint);

  useEffect(() => {
    setImageSelectedToPrint(
      "https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/123.png"
    );
  }, []);

  const handleSendDialog = async () => {
    if (!textAreaValue.trim()) return;

    const newUserMsg = { role: "user", type: "text", content: textAreaValue };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setTextAreaValue("");
    setIsLoading(true);

    try {
      const image_url = await submitFileUpload(); //@Joyce:測試圖片上傳
      // const res = await generateDialogueToImage(updatedMessages);
      const res = await generateDialogueToImage({
        //@Joyce:測試圖片上傳
        messages: updatedMessages,
        image_url: image_url || "",
      });
      console.log(res);
      const newMessages = res.new_messages || [];
      setMessages((prev) => [...prev, ...newMessages]);
      // submitFileUpload(); //@Joyce:測試圖片上傳，先測一下把圖一同傳入對話裡

      const imageUrls = res.new_messages
        .filter((msg) => msg.type === "image")
        .map((msg) => msg.image_url);
      setImageSelectedToPrint(imageUrls[0]); // 取第一張圖片的 URL，只會有一張
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `對話失敗，請稍後再試!` });
    } finally {
      setIsLoading(false);
    }
  };

  const submitFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await uploadImage(formData);
      console.log(res);
      if (res.code === 200) {
        showSwal({ isSuccess: true, title: `上傳成功!` });
        const filename = res.filename; // @Joyce:測試圖片上傳
        const url = `${S3_BASE_URL}${filename}`; // @Joyce:測試圖片上傳
        removeFile();
        return url; // @Joyce:測試圖片上傳
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
    // setTextAreaValue((prev) => `${prev}\n![圖片描述](${previewUrl})`);
    // setHasUploaded(true);
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview("");
    fileInputRef.current.value = null;
  };

  // if (isLoading) {
  //   return <LoadingIndicator />;
  // }
  return (
    <>
      {!isGenerationCompleted && (
        <div className="p-4 w-full max-w-4xl mx-auto border rounded-xl">
          <aside>
            {/* <h2 className="mb-4 text-xl font-semibold text-center">
                AI 設計師 · 對話式生圖
              </h2> */}
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

          <div className="mb-4 p-4 h-[400px] overflow-y-auto border-0 bg-white rounded-xl dark:bg-primary dark:text-black">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                {msg.type === "text" && (
                  <div
                    className={`px-2 py-2 inline-block rounded-xl ${
                      msg.role === "user" ? "bg-primaryYellow" : "bg-secondary"
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
                      className="max-w-full rounded-xl shadow"
                    />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              // <Spin tip="生成中...">
              //   <div style={{ minHeight: 40 }}></div>
              // </Spin>
              <LoadingIndicator />
            )}
          </div>
          <div className="mb-2 w-full flex justify-start items-center">
            {filePreview && (
              <div className="relative">
                <button className="absolute text-white" onClick={removeFile}>
                  <CloseCircleOutlined />
                </button>
                <img
                  src={filePreview}
                  alt="預覽圖片"
                  className="mr-2 w-16 rounded-xl shadow"
                />
              </div>
            )}
          </div>

          <div className="p-4 w-full border rounded-xl flex">
            <input
              type="file"
              ref={fileInputRef}
              accept=".png, .jpg, .jpeg, .pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <BaseButton onClick={() => fileInputRef.current?.click()}>
              <PlusOutlined />
            </BaseButton>
            <TextArea
              className="mx-2 border-0"
              rows={3}
              placeholder="描述你想要的畫面，可以繼續補充喔！"
              value={textAreaValue}
              onChange={(e) => setTextAreaValue(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendDialog();
                }
              }}
            />
            {textAreaValue.trim() !== "" && (
              <BaseButton onClick={handleSendDialog}>
                <ArrowRightOutlined />
              </BaseButton>
            )}
          </div>

          {/* <div className="mt-2 text-center">
            <BaseButton
              onClick={handleSendDialog}
              disabled={loading || !input.trim()}
            >
              {loading ? "生成中..." : "送出訊息"}
            </BaseButton>
            </div> */}
        </div>
      )}

      {isGenerationCompleted && (
        <div className="p-4 w-full max-w-4xl mx-auto border rounded-xl">
          <BaseButton
            className="my-4"
            onClick={() => setIsGenerationCompleted((prev) => !prev)}
          >
            <ArrowLeftOutlined />
            <span className="ml-2">返回</span>
          </BaseButton>
          <BaseButton
            label="排版"
            className="my-4 w-full"
            onClick={() => navigate("/illustration")}
          />
          <BaseButton
            label="列印"
            className="my-4 w-full"
            onClick={() =>
              navigate("/print", { state: { imageUrl: imageSelectedToPrint } })
            }
          />
        </div>
      )}
    </>
  );
};

export default Chatbot;
