import { useState, useRef, useEffect } from "react";
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
import { motion, useAnimation } from "framer-motion";
import picboxAvatar from "@/assets/images/picbox-avatar.png";

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
    "https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/123.png",
    "https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/456.png",
  ]);
  // console.log(imageSelectedToIllustrate);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [fileName, setFileName] = useState("");
  const [textContent, setTextContent] = useState("abc");
  const [fontSize, setFontSize] = useState(30);
  // const [imgUrls, setImgUrls] = useState([]);

  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const controls = useAnimation();
  const [x, setX] = useState(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const itemWidth = 300 + 16; // item width + gap

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;

    if (container && inner) {
      const max = inner.scrollWidth - container.offsetWidth;
      setMaxDrag(max);
    }
  }, [isGenerationCompleted]);

  const handleArrowClick = (dir) => {
    let newX = x;
    if (dir === "left") newX = Math.min(x + itemWidth, 0);
    if (dir === "right") newX = Math.max(x - itemWidth, -maxDrag);
    setX(newX);
    controls.start({ x: newX });
  };

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

      // Joyce測試自動開啟填表單流程
      if (res.next_step === "await_flyer_info" && res.image_filename) {
        setFileName(res.image_filename);
        setIsOpenForm(true);
      }
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

  const submitSelectedImage = async () => {
    const selectedImageUrl = imageSelectedToIllustrate[selectedIndex];
    console.log(selectedImageUrl);
    try {
      // 將 URL 轉換為 FormData
      // const formData = await convertUrlToFormData(selectedImageUrl);
      const formData = new FormData();
      formData.append("image_url", selectedImageUrl);
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

  // const convertUrlToFormData = async (url) => {
  //   try {
  //     const response = await fetch(url);
  //     const blob = await response.blob();

  //     const formData = new FormData();
  //     const fileName = url.substring(url.lastIndexOf("/") + 1); // 從 URL 提取檔案名稱
  //     formData.append("file", blob, fileName);
  //     for (const [key, value] of formData.entries()) {
  //       console.log(`${key}:`, value);
  //     }
  //     return formData;
  //   } catch (error) {
  //     console.error("轉換 URL 為 FormData 時發生錯誤:", error);
  //     throw error;
  //   }
  // };

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
          <div
            ref={containerRef}
            className="relative w-full max-w-5xl mx-auto overflow-hidden"
          >
            <div className="flex justify-center items-center gap-2 mb-4">
              <motion.img
                src={picboxAvatar}
                alt="picbox"
                className="w-8 duration-100 cursor-pointer"
                whileTap={{ scale: 1.8 }}
              />
              <h2 className="text-2xl text-center">: Which one?</h2>
            </div>

            {/* Carousel */}
            <motion.div
              ref={innerRef}
              className="flex gap-4 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: -maxDrag, right: 0 }}
              animate={controls}
              style={{
                width: `${imageSelectedToIllustrate.length * 250}px`, // 假設每張寬 300px
              }}
            >
              {imageSelectedToIllustrate.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`rounded-xl w-full border-2 ${
                    selectedIndex === index
                      ? "border-yellow-500"
                      : "border-gray-200"
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <motion.img
                    key={index}
                    src={imageUrl}
                    className="rounded-xl w-full object-cover shadow-lg"
                  />
                </div>
              ))}
            </motion.div>

            {/* Arrows */}
            <div className="px-2 z-10 h-10 w-full flex justify-between absolute inset-y-1/2 -translate-y-1/2">
              <BaseButton
                onClick={() => handleArrowClick("left")}
                className="bg-black/50 p-2 text-white"
              >
                <ArrowLeftOutlined />
              </BaseButton>
              <BaseButton
                onClick={() => handleArrowClick("right")}
                className="bg-black/50 p-2 text-white"
              >
                <ArrowRightOutlined />
              </BaseButton>
            </div>
          </div>

          <div className="flex justify-center items-center mt-4">
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
        </div>
      )}
    </>
  );
};

export default Home;
