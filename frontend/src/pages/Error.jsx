// import BaseLayout from "@/components/BaseLayout";
import { QuestionCircleOutlined } from "@ant-design/icons";
// import { useTranslation } from "react-i18next";

const Error = () => {
  // const { t } = useTranslation();
  return (
    // <BaseLayout>
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="text-6xl">
        <QuestionCircleOutlined />
      </div>
      {/* <p className="text-lg mt-4">{t(`Error.title`)}</p> */}
      <p className="text-lg mt-4">You are in Error Page</p>
    </div>
    // </BaseLayout>
  );
};

export default Error;
