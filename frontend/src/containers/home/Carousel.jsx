import { useState, useRef, useEffect } from "react";
import BaseButton from "@/components/BaseButton";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { motion, useAnimation } from "framer-motion";
import picboxAvatar from "@/assets/images/picbox-avatar.png";

const Carousel = () => {
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

  return (
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
  );
};

export default Carousel;
