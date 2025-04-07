import { useState } from "react";
import { Input, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import {
  CheckOutlined,
  FormOutlined,
  AreaChartOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
// import LoadingIndicator from "@/components/LoadingIndicator";
import { showSwal } from "@/utils/notification";
import { generateDialogueToImage } from "@/services/generateService";

const Chatbot = () => {
  const navigate = useNavigate();
  // const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGenerationCompleted, setIsGenerationCompleted] = useState(false);
  const { TextArea } = Input;

  const handleSend = async () => {
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

    // try {
    //   const res = await fetch(
    //     "https://epson-hey-echo.onrender.com/multi-dialogue-to-image",
    //     {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify({ messages: updatedMessages }),
    //     }
    //   );
    //   const data = await res.json();
    //   const newMessages = data.new_messages || [];
    //   setMessages((prev) => [...prev, ...newMessages]);
    // } catch (err) {
    //   console.error("發生錯誤:", err);
    // } finally {
    //   setLoading(false);
    // }
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
              <BaseButton className="ml-2">
                <AreaChartOutlined />
                <span className="ml-2">Upload</span>
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

          <div className="h-[400px] overflow-y-auto border p-3 bg-white rounded mb-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-3 ${
                  msg.role === "user" ? "text-right" : "text-left"
                }`}
              >
                {msg.type === "text" && (
                  <div
                    className={`inline-block px-3 py-2 rounded-lg ${
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

          <TextArea
            rows={3}
            placeholder="描述你想要的畫面，可以繼續補充喔！"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div className="text-center mt-3">
            <BaseButton
              onClick={handleSend}
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
