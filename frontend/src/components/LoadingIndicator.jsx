// import Icon from "@mdi/react";
// import { mdiLoading } from "@mdi/js";
import { useState, useEffect } from "react";
import gifDance from "@/assets/images/d-dance.gif";
import gifBored from "@/assets/images/b-bored.gif";
import picboxAvatar from "@/assets/images/picbox-avatar.png";

const LoadingIndicator = () => {
  const [currentGif, setCurrentGif] = useState(gifDance);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setCurrentGif(gifDance);
  //   }, 5000);
  //   return () => clearTimeout(timer);
  // }, []);

  const handleGifChange = () => {
    setCurrentGif((prevGif) => (prevGif === gifDance ? gifBored : gifDance));
  };

  return (
    <>
      {/* <div className="flex flex-col justify-start items-center"> */}
      {/* <div className="w-full h-[80vh] flex flex-col justify-center items-center">
        <Icon path={mdiLoading} size={1} />
        Loading...
      </div> */}
      <div className="flex">
        <div className="mr-2 w-8 h-8 rounded-full border border-secondary flex justify-center items-center shrink-0">
          <img
            src={picboxAvatar}
            alt="picbox"
            className="w-6 h-6 rounded-full"
          />
        </div>
        <div className="px-2 py-2 inline-block rounded-xl bg-secondary">
          <div className="loader"></div>
        </div>
      </div>
      <img
        src={currentGif}
        alt="gif"
        className="cursor-pointer scale-90"
        onClick={handleGifChange}
      />
      {/* </div> */}
    </>
  );
};

export default LoadingIndicator;
