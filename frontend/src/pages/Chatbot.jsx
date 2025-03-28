import { useState } from "react";
import { Input, Spin } from "antd";
import BaseButton from "@/components/BaseButton";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { TextArea } = Input;

  const handleSend = async () => {
    if (!input.trim()) return;

    const newUserMsg = { role: "user", type: "text", content: input };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://epson-hey-echo.onrender.com/multi-dialogue-to-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      const newMessages = data.new_messages || [];
      setMessages((prev) => [...prev, ...newMessages]);
    } catch (err) {
      console.error("發生錯誤:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 border rounded-lg">
      <h2 className="text-xl font-semibold mb-4 text-center">AI 設計師 · 對話式生圖</h2>

      <div className="h-[400px] overflow-y-auto border p-3 bg-white rounded mb-3">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-3 ${msg.role === "user" ? "text-right" : "text-left"}`}>
            {msg.type === "text" && (
              <div className={`inline-block px-3 py-2 rounded-lg ${msg.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
                {msg.content}
              </div>
            )}
            {msg.type === "image" && (
              <div className="mt-2">
                <img src={msg.image_url} alt="AI 圖片" className="max-w-full rounded shadow" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <Spin tip="生成中...">
            <div style={{ minHeight: 40 }}></div> {/* 占位 */}
          </Spin>
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
        <BaseButton onClick={handleSend} disabled={loading || !input.trim()}>
          {loading ? "生成中..." : "送出訊息"}
        </BaseButton>
      </div>
    </div>
  );
};

export default Chatbot;
