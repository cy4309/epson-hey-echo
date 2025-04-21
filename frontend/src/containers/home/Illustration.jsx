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
      <div className="p-4 w-full h-full max-w-4xl mx-auto border rounded-xl flex flex-col justify-center items-center">
        <span>沒有可用的圖片，請返回重新生成。</span>
        <BaseButton className="my-4" onClick={() => navigate("/login")}>
          <ArrowLeftOutlined />
          <span className="ml-2">回首頁</span>
        </BaseButton>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 w-full h-full max-w-4xl mx-auto border rounded-xl flex flex-col justify-center items-center">
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
            <BaseButton className="w-1/3 mx-2" onClick={onBack}>
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
