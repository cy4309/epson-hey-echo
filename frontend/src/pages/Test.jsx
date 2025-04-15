// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// export default function Test() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showLine, setShowLine] = useState(false);
//   const text = ["Hey,", "I'm ECHO!"];

//   const handleClose = () => {
//     setShowLine(true);
//     setTimeout(() => {
//       setIsOpen(false);
//       setShowLine(false);
//     }, 400); // 關機亮線動畫完再清掉
//   };

//   const modalVariants = {
//     hidden: {
//       scaleY: 0.01,
//       opacity: 0,
//       transition: {
//         duration: 0.4,
//         ease: [0.76, 0, 0.24, 1],
//       },
//     },
//     visible: {
//       scaleY: 1,
//       opacity: 1,
//       transition: {
//         duration: 0.4,
//         ease: [0.76, 0, 0.24, 1],
//       },
//     },
//   };

//   const lineVariants = {
//     initial: { scaleX: 1, opacity: 1 },
//     animate: {
//       scaleX: 0,
//       opacity: 0,
//       transition: {
//         duration: 0.4,
//         ease: [0.65, 0, 0.35, 1],
//       },
//     },
//   };

//   return (
//     <>
//       <div className="flex items-center justify-center">
//         <div className="overflow-hidden space-y-2">
//           {text.map((line, i) => (
//             <motion.div
//               key={i}
//               initial={{ y: "100%", opacity: 0 }}
//               animate={{ y: "0%", opacity: 1 }}
//               transition={{
//                 duration: 0.8,
//                 ease: [0.76, 0, 0.24, 1],
//                 delay: i * 0.3,
//               }}
//               className="text-4xl font-bold"
//             >
//               {line}
//             </motion.div>
//           ))}
//         </div>
//       </div>

//       <button
//         onClick={() => setIsOpen(true)}
//         className="px-4 py-2 bg-blue-500 rounded"
//       >
//         open
//       </button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             key="modal"
//             className="fixed inset-0 bg-black/90 flex items-center justify-center origin-center z-50"
//             variants={modalVariants}
//             initial="hidden"
//             animate="visible"
//             exit="hidden"
//             style={{ transformOrigin: "center center" }}
//           >
//             {!showLine ? (
//               <div className="bg-white text-black p-6 rounded-xl shadow-lg w-80 h-52 flex flex-col items-center justify-center relative">
//                 <div className="text-xl font-bold mb-2">Hi</div>
//                 <div className="text-sm text-center mb-4">content</div>
//                 <button
//                   onClick={handleClose}
//                   className="px-3 py-1 bg-red-500 text-white rounded"
//                 >
//                   close
//                 </button>
//               </div>
//             ) : (
//               <motion.div
//                 className="w-full h-1 bg-white rounded-full"
//                 variants={lineVariants}
//                 initial="initial"
//                 animate="animate"
//               />
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// export default function BubbleMenu() {
//   const [open, setOpen] = useState(false);

//   const menuVariants = {
//     closed: {
//       clipPath: "circle(0% at 90% 40px)",
//       transition: {
//         type: "spring",
//         stiffness: 400,
//         damping: 40,
//       },
//     },
//     open: {
//       clipPath: "circle(150% at 90% 40px)", // 擴張整個畫面
//       transition: {
//         type: "spring",
//         stiffness: 20,
//         restDelta: 2,
//       },
//     },
//   };

//   return (
//     <>
//       {/* 漢堡按鈕 */}
//       <div className="fixed top-4 right-4 z-50">
//         <button
//           onClick={() => setOpen(!open)}
//           className="relative w-8 h-6"
//           aria-label="Toggle menu"
//         >
//           <motion.span
//             className="absolute h-0.5 w-full bg-black"
//             animate={{ rotate: open ? 45 : 0, y: open ? 8 : 0 }}
//             transition={{ duration: 0.3 }}
//           />
//           <motion.span
//             className="absolute h-0.5 w-full bg-black top-1/2 -translate-y-1/2"
//             animate={{ opacity: open ? 0 : 1 }}
//             transition={{ duration: 0.2 }}
//           />
//           <motion.span
//             className="absolute h-0.5 w-full bg-black bottom-0"
//             animate={{ rotate: open ? -45 : 0, y: open ? -8 : 0 }}
//             transition={{ duration: 0.3 }}
//           />
//         </button>
//       </div>

//       {/* 選單背景 + 項目 */}
//       <AnimatePresence>
//         {open && (
//           <motion.div
//             className="fixed inset-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white z-40 p-10"
//             initial="closed"
//             animate="open"
//             exit="closed"
//             variants={menuVariants}
//           >
//             <div className="mt-20 space-y-6 text-3xl font-bold text-center">
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3 }}
//               >
//                 首頁
//               </motion.div>
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.5 }}
//               >
//                 作品集
//               </motion.div>
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.7 }}
//               >
//                 聯絡我
//               </motion.div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// }

import { useRef, useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";
import BaseButton from "@/components/BaseButton";
import picboxAvatar from "@/assets/images/picbox-avatar.png";

// const items = ["🚀", "🎮", "🎨", "📱", "💻"];
const items = [
  "https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/123.png",
  "https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/456.png",
  "https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/123.png",
  "https://prototype-collection-resource.s3.ap-northeast-1.amazonaws.com/blender-render/epson/456.png",
];

export default function Test() {
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
  }, []);

  const handleArrowClick = (dir) => {
    let newX = x;
    if (dir === "left") newX = Math.min(x + itemWidth, 0);
    if (dir === "right") newX = Math.max(x - itemWidth, -maxDrag);
    setX(newX);
    controls.start({ x: newX });
  };

  return (
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
      >
        {items.map((item, index) => (
          <motion.img
            key={index}
            src={item}
            className="rounded-xl w-2/3 object-cover shadow-lg"
          />
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
  );
}
