import { useState, useRef } from "react";
import { Input } from "antd";
import { useNavigate } from "react-router-dom";
import {
  CheckOutlined,
  FormOutlined,
  CloseCircleOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import { showSwal } from "@/utils/notification";
import { generateDialogueToImage } from "@/services/generateService";
import {
  uploadImage,
  generateMultiplePdfs,
} from "@/services/illustrateService";
// import { motion } from "framer-motion";

const Home = () => {
  const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL;
  const navigate = useNavigate();
  const { TextArea } = Input;
  const fileInputRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [textAreaValue, setTextAreaValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerationCompleted, setIsGenerationCompleted] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [imageSelectedToIllustrate, setImageSelectedToIllustrate] = useState([
    "https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/123.png",
    "https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/456.png",
    // "https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/123.png"
  ]);
  // console.log(imageSelectedToIllustrate);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [fileName, setFileName] = useState("");
  const [textContent, setTextContent] = useState("abc");
  const [fontSize, setFontSize] = useState(30);

  const handleSendDialog = async () => {
    if (!textAreaValue.trim()) return;
    const newUserMsg = { role: "user", type: "text", content: textAreaValue };
    const image_url = await submitFileUpload();
    // const newImageMsg = { role: "user", type: "image", image_url };
    // const fileName = file?.name || "";
    //測試回話開場
    const confirmMsg = {
      role: "assistant",
      type: "text",
      content: file
        ? `我已收到你的圖片，馬上幫你處理唷～`
        : `收到囉，我會根據你的描述來設計圖像！`,
    };
    const updatedMessages = [...messages, newUserMsg, confirmMsg];
    setMessages(updatedMessages);
    setTextAreaValue("");
    setIsLoading(true);

    try {
      // const newUserMsg = { role: "user", type: "text", content: textAreaValue };
      // const image_url = await submitFileUpload(); //@Joyce:測試圖片上傳
      // const res = await generateDialogueToImage(updatedMessages);
      // const newImageMsg = { role: "user", type: "image", image_url };
      // const updatedMessages = [...messages, newUserMsg, newImageMsg];
      // setMessages(updatedMessages);//@Joyce:測試圖片及訊息上傳
      // setTextAreaValue("");
      console.log("傳給後端的 messages:", updatedMessages);
      const res = await generateDialogueToImage({
        messages: updatedMessages,
        image_url: image_url || "",
      });
      console.log("後端回傳:", res);
      const newMessages = res.new_messages || [];
      setMessages((prev) => [...prev, ...newMessages]);

      const imageUrls = res.new_messages
        .filter((msg) => msg.type === "image")
        .map((msg) => msg.image_url);
      setImageSelectedToIllustrate(imageUrls);
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
        const filename = res.filename;
        const url = `${S3_BASE_URL}${filename}`;
        removeFile();
        return url;
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

  const convertUrlToFormData = async (url) => {
    try {
      const response = await fetch(url, { mode: "no-cors" });
      const blob = await response.blob();

      // 創建 FormData 並附加圖片
      const formData = new FormData();
      const fileName = url.substring(url.lastIndexOf("/") + 1); // 從 URL 提取檔案名稱
      formData.append("file", blob, fileName);
      console.log(formData);
      return formData;
    } catch (error) {
      console.error("轉換 URL 為 FormData 時發生錯誤:", error);
      throw error;
    }
  };

  const submitSelectedImage = async () => {
    const selectedImageUrl = imageSelectedToIllustrate[selectedIndex];
    try {
      // 將 URL 轉換為 FormData
      const formData = await convertUrlToFormData(selectedImageUrl);

      // 將 FormData 發送到後端
      const res = await uploadImage(formData);
      console.log("上傳圖片結果:", res);

      if (res.code === 200) {
        showSwal({ isSuccess: true, title: `上傳成功!` });
        setFileName(res.filename);
        setIsOpenForm(true);
        // navigate("/illustration", {
        //   state: { imageUrl: selectedImageUrl },
        // });
      } else {
        showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
      }
    } catch (error) {
      console.error("上傳圖片時發生錯誤:", error);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };

  const submitFile = async () => {
    if (!textContent || !fontSize) {
      showSwal({ isSuccess: false, title: `請輸入文字內容和字體大小` });
      return;
    }
    const payload = {
      image_filename: fileName,
      content: textContent,
      font_size: fontSize,
    };
    console.log(payload);

    try {
      const res = await generateMultiplePdfs(payload);
      console.log(res);
      if (res.code === 200) {
        showSwal({ isSuccess: true, title: `上傳成功!` });
        // setImgUrls(res.img_urls);
        navigate("/illustration", {
          state: { imgUrls: res.img_urls }, // 將後端返回的圖片 URL 傳遞到 /illustration 頁面
        });
      } else {
        showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
      }
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
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
            {/* <motion.div
              className="w-[200px] h-[200px] rounded-full bg-black"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ repeat: Infinity, duration: 2 }}
            /> */}
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
          <h2 className="text-center">Which one do you like?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-center items-center">
            {imageSelectedToIllustrate.map((imageUrl, index) => (
              <div
                key={index}
                className={`rounded-xl w-full max-w-sm ${
                  selectedIndex === index ? "bg-green-500" : "bg-red-500"
                }`}
                onClick={() => setSelectedIndex(index)}
              >
                <img
                  src={imageUrl}
                  alt={`Image ${index + 1}`}
                  className="scale-95 rounded-xl shadow"
                />
              </div>
            ))}
            {/* </div> */}
            <BaseButton
              className="my-4"
              onClick={() => setIsGenerationCompleted((prev) => !prev)}
            >
              <ArrowLeftOutlined />
              <span className="ml-2">Back</span>
            </BaseButton>
            <BaseButton onClick={submitSelectedImage}>
              <ArrowRightOutlined />
              <span className="ml-2">Next</span>
            </BaseButton>
          </div>

          {isOpenForm && (
            <>
              <Input
                name="text"
                placeholder="輸入文字內容"
                className="m-2"
                size="large"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
              <Input
                name="text"
                placeholder="字體大小"
                className="m-2"
                size="large"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
              <BaseButton className="m-2" label="送出" onClick={submitFile} />
              {/* <BaseButton className="m-2" label="列印" onClick={submitPrint} /> */}
            </>
          )}

          {/* <BaseButton
            label="排版"
            className="my-4 w-full"
            onClick={() => navigate("/illustration")}
          /> */}
          {/* <BaseButton
            label="列印"
            className="my-4 w-full"
            onClick={() =>
              navigate("/print", {
                state: { imageUrl: imageSelectedToIllustrate },
              })
            }
          /> */}
        </div>
      )}
    </>
  );
};

export default Home;
