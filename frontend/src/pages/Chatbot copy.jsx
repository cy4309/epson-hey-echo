import React, { useState } from "react";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("zh");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setPrompt("");
    setImageUrl("");
  
    try {
      const promptRes = await fetch("https://epson-hey-echo.onrender.com/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, lang }),
      });
      const promptData = await promptRes.json();
      const finalPrompt = promptData.prompt;
      setPrompt(finalPrompt);
  
      const imageRes = await fetch("https://epson-hey-echo.onrender.com/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });
      const imageData = await imageRes.json();
      setImageUrl(imageData.image_url);
    } catch (err) {
      console.error("錯誤:", err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <h2>AI 生圖 Chatbot</h2>

      <label>語言：</label>
      <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ marginBottom: "1rem" }}>
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>

      <textarea
        rows={4}
        placeholder="輸入你想要的畫面描述"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem" }}
      />

      <button onClick={generate} disabled={loading}>
        {loading ? "生成中..." : "開始生成"}
      </button>

      {prompt && (
        <div style={{ marginTop: "1.5rem" }}>
          <h4>GPT 生成的 Prompt：</h4>
          <p>{prompt}</p>
        </div>
      )}

      {imageUrl && (
        <div style={{ marginTop: "1.5rem" }}>
          <h4>生成圖像：</h4>
          <img src={imageUrl} alt="生成圖" style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
};

export default Chatbot;