import { useState } from "react";
import { showSwal } from "@/utils/notification";
import { generatePrompt } from "@/services/generateService";
import { Select, Input } from "antd";
import BaseButton from "@/components/BaseButton";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("zh");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { Option } = Select;
  const { TextArea } = Input;

  const generate = async () => {
    try {
      const res = await generatePrompt(input, lang);
      console.log(res.data);
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };

  // const generate = async () => {
  //   setLoading(true);
  //   setPrompt("");
  //   setImageUrl("");

  //   try {
  //     const promptRes = await fetch("https://epson-hey-echo.onrender.com/generate-prompt", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ input, lang }),
  //     });
  //     const promptData = await promptRes.json();
  //     const finalPrompt = promptData.prompt;
  //     setPrompt(finalPrompt);

  //     const imageRes = await fetch("https://epson-hey-echo.onrender.com/generate-image", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ prompt: finalPrompt }),
  //     });
  //     const imageData = await imageRes.json();
  //     setImageUrl(imageData.image_url);
  //   } catch (err) {
  //     console.error("錯誤:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <>
      <div className="w-full p-4 border flex flex-col justify-center items-center rounded-lg">
        <h2 className="mb-2">AI 生圖 Chatbot</h2>
        <div>
          <label className="m-2">語言：</label>
          <Select value={lang} onChange={(e) => setLang(e.target.value)}>
            <Option value="zh">中文</Option>
            <Option value="en">English</Option>
          </Select>
        </div>

        <TextArea
          className="m-2"
          rows={4}
          placeholder="輸入你想要的畫面描述"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <BaseButton onClick={generate} disabled={loading}>
          {loading ? "生成中..." : "開始生成"}
        </BaseButton>

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
    </>
  );
};

export default Chatbot;
