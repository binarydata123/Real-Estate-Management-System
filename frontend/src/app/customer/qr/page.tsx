"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, ShieldCheck } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { approveQr } from "@/lib/Customer/qrAPI";

const DeviceLoginTab: React.FC = () => {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // 🔹 Check camera availability
  const hasCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((device) => device.kind === "videoinput");
    } catch {
      return false;
    }
  };

  const handleScan = async (qrText?: string) => {
    if (!qrText) return;

    try {
      await stopScanning();
      setError(null);

      const res = await approveQr(qrText);

      if (res.success) {
        setSuccess(true);
      } else {
        setError("Invalid or expired QR code.");
      }
    } catch (err) {
      console.error("QR approve error", err);
      setError("Failed to approve login.");
    }
  };

  const stopScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch (err) {
      console.log("Stop error:", err);
    }
    setScanning(false);
  };

  // Start camera AFTER DOM renders
  useEffect(() => {
    if (!scanning) return;

    const startScanner = async () => {
      try {
        const cameraExists = await hasCamera();
        if (!cameraExists) {
          setError("No camera detected on this device.");
          setScanning(false);
          return;
        }

        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          (decodedText) => {
            handleScan(decodedText);
          },
          () => {},
        );
      } catch (err) {
        console.error("Camera start error:", err);
        setError("Unable to access camera. Please allow camera permission.");
        setScanning(false);
      }
    };

    startScanner();

    return () => {
      stopScanning();
    };
  }, [scanning]);

  return (
    <div className="space-y-3 md:space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 md:mb-4 mb-2">
          Device Login
        </h3>

        <div className="md:space-y-4 space-y-2">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">
                  Login from another device
                </h4>
                <p className="text-sm text-gray-500">
                  Scan a QR code shown on another device to securely log in.
                </p>
              </div>
            </div>

            {!scanning && !success && (
              <button
                onClick={() => {
                  setError(null);
                  setSuccess(false);
                  setScanning(true);
                }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 
                bg-gradient-to-br from-[#0A2540] via-[#0E2F52] to-[#081C30] 
                text-white rounded-lg 
                hover:from-[#0E2F52] hover:via-[#103B66] hover:to-[#0A2540]
                transition-all duration-200"
              >
                <Camera className="w-4 h-4" />
                Scan QR Code
              </button>
            )}

            {scanning && (
              <div className="mt-4 space-y-3">
                <div id="qr-reader" className="w-full max-w-sm mx-auto"></div>

                <button
                  onClick={stopScanning}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Cancel scanning
                </button>
              </div>
            )}

            {success && (
              <p className="mt-4 text-sm text-green-600 font-medium">
                ✅ Login approved successfully
              </p>
            )}

            {error && (
              <p className="mt-4 text-sm text-red-600 font-medium">
                ❌ {error}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceLoginTab;
