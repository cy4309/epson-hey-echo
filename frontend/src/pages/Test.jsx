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

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef, useState } from "react";

const items = [
  {
    actName: "Act I",
    description: "Description of Act I",
  },
  {
    actName: "Act II",
    description: "Description of Act II",
  },
  {
    actName: "Act III",
    description: "Description of Act III",
  },
];

const GAP = 24;
const ITEM_WIDTH = 320;
const trackItemOffset = ITEM_WIDTH + GAP;

export default function Test() {
  const x = useMotionValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const constraintsRef = useRef(null);

  const handleDragEnd = (_, info) => {
    const offset = info.offset.x;
    const direction = offset < 0 ? 1 : -1;
    const newIndex = Math.min(
      Math.max(currentIndex + direction, 0),
      items.length - 1
    );
    setCurrentIndex(newIndex);
  };

  return (
    <div className="overflow-hidden w-full py-16 bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] flex justify-center">
      <motion.div
        className="flex"
        ref={constraintsRef}
        drag="x"
        dragConstraints={{
          left: -trackItemOffset * (items.length - 1),
          right: 0,
        }}
        dragElastic={0.15}
        style={{
          x,
          gap: `${GAP}px`,
          perspective: 1200,
        }}
        animate={{ x: -(currentIndex * trackItemOffset) }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        onDragEnd={handleDragEnd}
      >
        {items.map((item, index) => {
          const range = [
            -(index + 1) * trackItemOffset,
            -index * trackItemOffset,
            -(index - 1) * trackItemOffset,
          ];
          const rotateY = useTransform(x, range, [45, 0, -45]);
          const scale = useTransform(x, range, [0.85, 1, 0.85]);
          const opacity = useTransform(x, range, [0.4, 1, 0.4]);

          return (
            <motion.div
              key={index}
              className="shrink-0 p-6 rounded-2xl bg-[#1f1f2e] border border-[#333] shadow-lg backdrop-blur-xl"
              style={{
                width: ITEM_WIDTH,
                height: 360,
                rotateY,
                scale,
                opacity,
              }}
            >
              <div className="font-bold text-2xl mb-2 text-white">
                {item.actName}
              </div>
              <p className="text-sm text-gray-300">{item.description}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
