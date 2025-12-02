import { otpHandler } from "@/lib/Authentication/AuthenticationAPI";
import { showSuccessToast } from "@/utils/toastHandler";
import { useEffect, useRef, useState } from "react";

interface OtpProps {
  phone: string | undefined;
  onClose: () => void; 
  onSuccess: () => void; 
}

const OtpModal: React.FC<OtpProps> = ({ phone, onClose, onSuccess }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [seconds, setSeconds] = useState(60);
  const [message,setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 100);
      return () => clearTimeout(timer);
    }
  }, [seconds]);

  useEffect(() => {
    if(message){
      const timer = setTimeout(() => setMessage(null),3000);
      return () => clearTimeout(timer);
    }
  },[message])

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeString = `${minutes}:${secs.toString().padStart(2, "0")}`;

  const handleSubmit = async (resend = false) => {
    const otp = inputRefs.current.map((ele) => ele?.value || "").join("");
    if (resend === true || otp.length === 4) {
        try{
            const response = await otpHandler({ phone, otp, resend });
            if(response.data.success === true && response.data.requiresOtp === false){
                showSuccessToast(response.data.message);
                onSuccess();
            } else if (response.data.success === true && response.data.requiresOtp === true) {
              // showErrorToast(response.data.message);
              setMessage(response.data.message);
            } else if (response.data.success === false){
              setMessage(response.data.message);
            }
        }catch (err) {
            console.error("Error Catched on OTP Submit : ",err);
            setMessage("Error During OTP Submission");
        }
    } else {
      setMessage("Please Enter All Four Digits of the OTP");
    }
  };

  return (
    <div className="bg-black/50 backdrop-blur-sm h-screen w-screen absolute top-0 left-0 flex justify-center items-center">
      <div className="bg-white h-[45%] w-[350px] flex items-center flex-col p-4 relative rounded-3xl shadow-2xl">
        <h1 className="font-extrabold text-xl text-center pt-6 px-4 leading-tight">
          Enter Otp Sent To Your Number {phone} on WhatsApp
        </h1>
        <div className="pt-10 gap-4 flex">
          <input
            type="text"
            maxLength={1}
            pattern="[0-9]"
            inputMode="numeric"
            ref={(el) => {
              inputRefs.current[0] = el;
            }}
            className={`!w-12 !h-12 !text-lg !border-2 ${message === null ? "!border-gray-300" : "!border-red-500"} !rounded-xl focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200 focus:!outline-none !text-center !appearance-none !transition-all`}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9]/g,
                ""
              );
              if (e.currentTarget.value) {
                const next = e.currentTarget.nextElementSibling;
                if (next) (next as HTMLInputElement).focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !e.currentTarget.value) {
                const prev = e.currentTarget.previousElementSibling;
                if (prev) (prev as HTMLInputElement).focus();
              }
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <input
            type="text"
            maxLength={1}
            pattern="[0-9]"
            inputMode="numeric"
            ref={(el) => {
              inputRefs.current[1] = el;
            }}
            className={`!w-12 !h-12 !text-lg !border-2 ${message === null ? "!border-gray-300" : "!border-red-500"} !rounded-xl focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200 focus:!outline-none !text-center !appearance-none !transition-all`}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9]/g,
                ""
              );
              if (e.currentTarget.value) {
                const next = e.currentTarget.nextElementSibling;
                if (next) (next as HTMLInputElement).focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !e.currentTarget.value) {
                const prev = e.currentTarget.previousElementSibling;
                if (prev) (prev as HTMLInputElement).focus();
              }
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <input
            type="text"
            maxLength={1}
            pattern="[0-9]"
            inputMode="numeric"
            ref={(el) => {
              inputRefs.current[2] = el;
            }}
            className={`!w-12 !h-12 !text-lg !border-2 ${message === null ? "!border-gray-300" : "!border-red-500"} !rounded-xl focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200 focus:!outline-none !text-center !appearance-none !transition-all`}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9]/g,
                ""
              );
              if (e.currentTarget.value) {
                const next = e.currentTarget.nextElementSibling;
                if (next) (next as HTMLInputElement).focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !e.currentTarget.value) {
                const prev = e.currentTarget.previousElementSibling;
                if (prev) (prev as HTMLInputElement).focus();
              }
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
          <input
            type="text"
            maxLength={1}
            pattern="[0-9]"
            inputMode="numeric"
            ref={(el) => {
              inputRefs.current[3] = el;
            }}
            className={`!w-12 !h-12 !text-lg !border-2 ${message === null ? "!border-gray-300" : "!border-red-500"} !rounded-xl focus:!border-blue-500 focus:!ring-2 focus:!ring-blue-200 focus:!outline-none !text-center !appearance-none !transition-all`}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^0-9]/g,
                ""
              );
              if (e.currentTarget.value) {
                const next = e.currentTarget.nextElementSibling;
                if (next) (next as HTMLInputElement).focus();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !e.currentTarget.value) {
                const prev = e.currentTarget.previousElementSibling;
                if (prev) (prev as HTMLInputElement).focus();
              }
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </div>
        <p className="text-red-500 font-bold pt-3">{message !== null ? message : ""}</p>
        <button
          onClick={() => handleSubmit()}
          className="!cursor-pointer !text-white !bg-blue-600 hover:!bg-blue-700 !font-bold !rounded-xl !absolute !bottom-14 !px-6 !py-2 !shadow-lg hover:!shadow-xl !transition-all"
        >
          Submit
        </button>
        <p
          onClick={() => onClose()}
          className="text-blue-600 cursor-pointer hover:underline absolute bottom-8 font-semibold text-sm transition-all"
        >
          Change Number?
        </p>
        <p onClick={() => {if(seconds === 0) {handleSubmit(true); setSeconds(60)}}} className={`absolute bottom-2 text-sm font-medium ${seconds > 0 ? 'text-gray-600' : 'text-blue-600 cursor-pointer hover:underline'}`}>{seconds > 0 ? timeString : "Resend OTP"}</p>
      </div>
    </div>
  );
};

export default OtpModal;
