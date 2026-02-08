import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';

const QRPage = ({ onClose }) => {
  const [qrImage, setQrImage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const statusRes = await axios.get(`${backendUrl}/api/whatsapp/status`);
        const connected = statusRes.data.connected;
        setIsConnected(connected);

        if (!connected) {
          const qrRes = await axios.get(`${backendUrl}/api/whatsapp/qr`);
          if (qrRes.data.qr) {
            setQrImage(qrRes.data.qr);
          }
        } else {
          setQrImage(null);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching QR or status", err);
        setLoading(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [backendUrl]);

  // 👇 Auto-close modal after connected
  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => {
        onClose(); // close modal after 3 seconds
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative text-center border border-gray-200 transform transition-all duration-300 hover:scale-[1.01]">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          onClick={onClose}
          aria-label="Close QR modal"
        >
          <FaTimes />
        </button>

        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">WhatsApp Connection</h1>
          <p className="text-gray-500 mt-1">Scan QR code to connect your account</p>
        </div>

        {loading ? (
          <div className="py-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-blue-200 rounded-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : isConnected ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center justify-center">
            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-sm font-medium text-green-800">
              Successfully connected to WhatsApp!
            </span>
          </div>
        ) : qrImage ? (
          <>
            <div className="p-4 bg-white rounded-lg border border-gray-200 inline-block mb-4">
              <img
                src={qrImage}
                alt="WhatsApp QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-gray-600 mb-2">Scan this QR code with your WhatsApp</p>
            <p className="text-xs text-gray-400">
              Open WhatsApp → Settings → Linked Devices → Scan QR Code
            </p>
          </>
        ) : (
          <div className="py-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-blue-200 rounded-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        )}

        {!loading && !isConnected && (
          <div className="mt-6 text-xs text-gray-400">
            <p>Automatically refreshes every 3 seconds</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRPage;
