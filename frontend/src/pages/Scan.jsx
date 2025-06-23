import { useState, useEffect, useRef } from "react";
import BaseButton from "@/components/BaseButton";
import { useNavigate } from "react-router-dom";
import { showSwal } from "@/utils/notification";
import { Modal, Input } from "antd";
import { ArrowLeftOutlined, ScanOutlined } from "@ant-design/icons";
import {
  getAuthCode,
  postAccessToken,
  postScanDestination,
  deleteScanDestination,
} from "@/services/epsonService";

const Scan = () => {
  const navigate = useNavigate();
  const hasTriggeredRef = useRef(false);
  const epsonScanEmail = localStorage.getItem("epson_scan_email");
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailSet, setIsEmailSet] = useState(false);

  useEffect(() => {
    if (epsonScanEmail && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true; // 僅執行一次
      setModalOpen(true);
      setEmail(epsonScanEmail); // 先設入 state（視覺上用）
      executeScan(epsonScanEmail); // 自動執行掃描流程
    }
  }, [epsonScanEmail]);

  const executeScan = async (email) => {
    try {
      // Step 1: Handle Auth Code
      console.log("Step 1: Getting Auth Code...");
      if (!epsonScanEmail) {
        // 儲存 email 與來源頁資訊
        localStorage.setItem("epson_scan_email", email);
        handleAuthCode();
        return;
      }

      // Step 2: Post Access Token
      console.log("Step 2: Posting Access Token...");
      await handleAccessToken();

      // Step 3: Create Scan Destination
      console.log("Step 3: Creating Scan Destination...");
      await handleScanDestination(email);

      console.log("Scan process completed successfully!");
      showSwal({ isSuccess: true, title: "請移至印表機上完成操作!" });
    } catch (err) {
      console.error("Error during scan process:", err);
      showSwal({ isSuccess: false, title: "掃描失敗，請稍後再試!" });
    }
  };

  const executeDeleteScan = async () => {
    try {
      // Step 4: Delete Scan Destination
      console.log("Step 4: Deleting Scan Destination...");
      await handleDeleteScanDestination();
      showSwal({ isSuccess: true, title: "掃描目的地已刪除!" });
      localStorage.removeItem("epson_scan_email");
      setModalOpen(false);
    } catch (err) {
      console.error("Error during delete scan process:", err);
      showSwal({ isSuccess: false, title: "刪除掃描目的地失敗，請稍後再試!" });
    }
  };

  const handleAuthCode = () => {
    getAuthCode();
  };
  const handleAccessToken = async () => {
    try {
      const res = await postAccessToken();
      console.log(res);
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };
  const handleScanDestination = async (email) => {
    try {
      const res = await postScanDestination(email);
      console.log(res);
      showSwal({
        isSuccess: true,
        title: `設置成功!`,
      });
      setIsEmailSet(true);
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };
  const handleDeleteScanDestination = async () => {
    try {
      const res = await deleteScanDestination();
      console.log(res);
    } catch (err) {
      console.error(err);
      showSwal({ isSuccess: false, title: `上傳失敗，請稍後再試!` });
    }
  };

  return (
    <div className="p-4 w-full h-full max-w-4xl mx-auto border rounded-xl flex flex-col justify-center items-center">
      <span>掃描設定後，請移至印表機上完成操作。</span>
      <div className="my-4 w-full flex justify-center items-center">
        <BaseButton className="w-full mx-2" onClick={() => navigate("/login")}>
          <ArrowLeftOutlined />
          <span className="ml-2">回首頁</span>
        </BaseButton>

        <BaseButton className="w-full mx-2" onClick={() => setModalOpen(true)}>
          <ScanOutlined />
          <span className="ml-2">掃描設定</span>
        </BaseButton>

        <Modal
          title="掃描設定"
          open={modalOpen}
          footer={null} // 取消預設 footer
          onCancel={() => setModalOpen(false)}
        >
          <Input
            placeholder="請輸入電子郵箱"
            className="mb-4"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* 自訂按鈕 */}
          <div className="flex justify-end items-center gap-2">
            <BaseButton onClick={() => setModalOpen(false)}>取消</BaseButton>
            {!isEmailSet ? (
              <BaseButton onClick={() => executeScan(email)}>確定</BaseButton>
            ) : (
              <BaseButton onClick={() => executeDeleteScan()}>完成</BaseButton>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Scan;
