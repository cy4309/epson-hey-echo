// import { useState, useRef } from "react";
// import BaseButton from "@/components/BaseButton";
// import {
//   uploadImage,
//   generateMultiplePdfs,
// } from "@/services/illustrateService";
// import { showSwal } from "@/utils/notification";
// import { Input } from "antd";

// const Illustration = () => {
//   const fileInputRef = useRef(null);
//   const [file, setFile] = useState(null);
//   const [filePreview, setFilePreview] = useState("");
//   const [hasUploaded, setHasUploaded] = useState(false);
//   const [isUploaded, setIsUploaded] = useState(false);
//   const [fileName, setFileName] = useState("");
//   const [textContent, setTextContent] = useState("abc");
//   const [fontSize, setFontSize] = useState(30);
//   const [imgUrls, setImgUrls] = useState([]);

//   // const handleFileUpload = (e) => {
//   //   const selectedFile = e.target.files?.[0];
//   //   if (!selectedFile) return;

//   //   const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
//   //   if (!allowedTypes.includes(selectedFile.type)) {
//   //     showSwal(false, "只支援 PNG、JPG、JPEG 格式");
//   //     return;
//   //   }

//   //   setFile(selectedFile);
//   //   setFilePreview(URL.createObjectURL(selectedFile));
//   //   setHasUploaded(true);
//   // };

//   // const submitImg = async () => {
//   //   if (!file) return;

//   //   const formData = new FormData();
//   //   formData.append("file", file);

//   //   try {
//   //     const res = await uploadImage(formData);
//   //     console.log(res);
//   //     if (res.code === 200) {
//   //       showSwal({ isSuccess: true, title: `上傳成功!` });
//   //       setIsUploaded(true);
//   //       setFileName(res.filename);
//   //     } else {
//   //       showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
//   //     }
//   //   } catch (err) {
//   //     console.error(err);
//   //     showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
//   //   }
//   // };

//   // const submitFile = async () => {
//   //   if (!textContent || !fontSize) {
//   //     showSwal({ isSuccess: false, title: `請輸入文字內容和字體大小` });
//   //     return;
//   //   }
//   //   const payload = {
//   //     image_filename: fileName,
//   //     content: textContent,
//   //     font_size: fontSize,
//   //   };
//   //   console.log(payload);

//   //   try {
//   //     const res = await generateMultiplePdfs(payload);
//   //     console.log(res);
//   //     if (res.code === 200) {
//   //       showSwal({ isSuccess: true, title: `上傳成功!` });
//   //       setImgUrls(res.img_urls);
//   //     } else {
//   //       showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
//   //     }
//   //   } catch (err) {
//   //     console.error(err);
//   //     showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
//   //   }
//   // };

//   return (
//     <>
//       {filePreview && (
//         <div className="w-1/2 h-1/2 flex justify-center items-center rounded-xl">
//           <img
//             className="w-full h-full rounded-xl object-contain"
//             src={filePreview}
//             alt="preview"
//           />
//         </div>
//       )}

//       <input
//         type="file"
//         ref={fileInputRef}
//         accept=".png, .jpg, .jpeg"
//         className="hidden"
//         onChange={handleFileUpload}
//       />
//       {!hasUploaded ? (
//         <BaseButton
//           label="上傳圖片"
//           onClick={() => fileInputRef.current?.click()}
//           className="w-2/3 m-4 rounded-xl"
//         ></BaseButton>
//       ) : (
//         <div className="w-2/3">
//           <button
//             className="w-12 h-12 m-4 bg-primaryColorGray rounded-xl flex justify-center items-center cursor-pointer"
//             onClick={() => fileInputRef.current?.click()}
//           >
//             {/* <FontAwesomeIcon icon={faImage} className="text-xl" /> */}
//           </button>
//         </div>
//       )}
//       {filePreview && !isUploaded && (
//         <BaseButton
//           label="送出圖片"
//           onClick={submitImg}
//           className="w-2/3 m-4"
//           defaultValue="abc"
//         />
//       )}
//       {isUploaded && (
//         <>
//           <Input
//             name="text"
//             placeholder="輸入文字內容"
//             className="m-2"
//             size="large"
//             value={textContent}
//             onChange={(e) => setTextContent(e.target.value)}
//           />
//           <Input
//             name="text"
//             placeholder="字體大小"
//             className="m-2"
//             size="large"
//             value={fontSize}
//             onChange={(e) => setFontSize(Number(e.target.value))}
//           />
//           <BaseButton className="m-2" label="送出" onClick={submitFile} />
//           {/* <BaseButton className="m-2" label="列印" onClick={submitPrint} /> */}
//         </>
//       )}
//       {imgUrls.length > 0 && (
//         <div className="gap-6 flex justify-center items-center scale-75">
//           {imgUrls.map((url, index) => (
//             <img
//               key={index}
//               src={url}
//               className="h-[400px] rounded-xl shadow"
//               // title={`pdf-preview-${index}`}
//             />
//             // <iframe
//             //   key={index}
//             //   src={`${import.meta.env.VITE_BACKEND_API_BASE_URL}${url}`}
//             //   className="h-[400px] rounded-xl shadow"
//             //   // title={`pdf-preview-${index}`}
//             // />
//           ))}
//         </div>
//       )}
//     </>
//   );
// };

import { useState, useRef, useEffect } from "react";
// import { useLocation } from "react-router-dom";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { motion, useAnimation } from "framer-motion";
import picboxAvatar from "@/assets/images/picbox-avatar.png";
import BaseButton from "@/components/BaseButton";
import { showSwal } from "@/utils/notification";
import { useNavigate } from "react-router-dom";
// import LoadingIndicator from "@/components/LoadingIndicator";
import PropTypes from "prop-types";

const Illustration = ({ imgUrls, onBack }) => {
  // const location = useLocation();
  const navigate = useNavigate();
  // const { imgUrls } = location.state || {};
  // const [isLoading, setIsLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const controls = useAnimation();
  const [x, setX] = useState(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const itemWidth = 300 + 16; // item width + gap

  useEffect(() => {
    // setIsLoading(false);
    console.log("imgUrls", imgUrls);
    const container = containerRef.current;
    const inner = innerRef.current;

    if (container && inner) {
      const max = inner.scrollWidth - container.offsetWidth;
      setMaxDrag(max);
    }
  }, [imgUrls]);

  const handleArrowClick = (dir) => {
    let newX = x;
    if (dir === "left") newX = Math.min(x + itemWidth, 0);
    if (dir === "right") newX = Math.max(x - itemWidth, -maxDrag);
    setX(newX);
    controls.start({ x: newX });
  };

  const submitSelectedIllustration = () => {
    // console.log(`Selected image URL: ${imgUrls[selectedIndex]}`);
    showSwal({ isSuccess: true, title: `上傳成功!` });
    navigate("/print", {
      state: { imgUrlToPrint: imgUrls[selectedIndex] },
    });
  };

  if (!imgUrls || imgUrls.length === 0) {
    return (
      <>
        <span>沒有可用的圖片，請返回重新生成。</span>
        <BaseButton className="my-4" onClick={() => navigate("/login")}>
          <span className="mr-2">回首頁</span>
          <ArrowRightOutlined />
        </BaseButton>
      </>
    );
  }

  // return (
  //   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  //     {imgUrls.map((url, index) => (
  //       <div key={index} className="rounded-xl shadow">
  //         <img
  //           src={url}
  //           alt={`排版圖片 ${index + 1}`}
  //           className="w-full rounded-xl"
  //         />
  //       </div>
  //     ))}
  //   </div>
  // );

  return (
    <>
      <div className="p-4 w-full max-w-4xl mx-auto border rounded-xl">
        {/* {isLoading && <LoadingIndicator />} */}
        {/* {!isLoading && ( */}
        <>
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
              <h2 className="text-2xl text-center">..Which one?</h2>
            </div>

            {/* Carousel */}
            <motion.div
              ref={innerRef}
              className="flex gap-4 cursor-grab active:cursor-grabbing"
              drag="x"
              dragConstraints={{ left: -maxDrag, right: 0 }}
              animate={controls}
              style={{
                width: `${imgUrls.length * 250}px`, // 假設每張寬 300px
              }}
            >
              {imgUrls.map((imageUrl, index) => (
                <div
                  key={index}
                  className={`rounded-xl w-full border-2 ${
                    selectedIndex === index
                      ? "border-primary"
                      : "border-secondary"
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
            {window.innerWidth >= 1024 && (
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
            )}
          </div>

          <div className="my-4 flex justify-center items-center">
            {/* <BaseButton
            className="mx-2"
            onClick={() => setIsGenerationCompleted((prev) => !prev)}
          >
            <ArrowLeftOutlined />
            <span className="ml-2">Back</span>
          </BaseButton> */}

            <BaseButton className="w-1/2 mx-2" onClick={onBack}>
              <ArrowLeftOutlined />
              <span className="ml-2">Back</span>
            </BaseButton>
            <BaseButton
              className="w-full mx-2"
              onClick={submitSelectedIllustration}
            >
              <span className="mr-2">Print</span>
              <ArrowRightOutlined />
            </BaseButton>
          </div>
        </>
        {/* )} */}
      </div>
    </>
  );
};

Illustration.propTypes = {
  imgUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
  onBack: PropTypes.func.isRequired,
};

export default Illustration;
