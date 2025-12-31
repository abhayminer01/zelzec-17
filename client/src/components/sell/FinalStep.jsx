import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useSell } from "../../contexts/SellContext";

export default function FinalStep() {
  const [size, setSize] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const { resetAll } = useSell();

  useEffect(() => {
    let currentSize = 0;
    const interval = setInterval(() => {
      currentSize += 3;
      if (currentSize >= 96) {
        currentSize = 96;
        clearInterval(interval);
      }
      setSize(currentSize);
    }, 12);
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);
    const closeTimer = setTimeout(() => {
      resetAll();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, [resetAll]);

  return (
    <div
      className={`fixed inset-0 bg-black/50 md:bg-black/50 bg-white md:flex md:items-center md:justify-center z-50 transition-opacity duration-500 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      <div
        className={`bg-white rounded-none md:rounded-2xl shadow-xl w-full h-full md:w-[400px] md:h-auto p-6 md:p-8 flex flex-col relative transition-transform duration-300 ${fadeOut ? 'scale-95' : 'scale-100'
          }`}
      >
        <div className="flex-1 md:flex-none flex flex-col items-center justify-center">
          <div
            className={`w-48 h-48 md:w-24 md:h-24 flex items-center justify-center rounded-full bg-primary transition-all duration-300 ${size >= 96 ? 'scale-110' : 'scale-100'
              }`}
            style={{
              animation: size >= 96 ? 'bounce 0.5s ease-in-out' : 'none'
            }}
          >
            <CheckCircle
              size={size * 2}
              className="md:hidden"
              stroke="white"
              strokeWidth={2.5}
            />
            <CheckCircle
              size={size}
              className="hidden md:block"
              stroke="white"
              strokeWidth={2.5}
            />
          </div>
          <h2
            className={`mt-6 text-xl font-semibold text-gray-800 hidden md:block transition-all duration-300 ${size >= 96 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            Successfully Posted!
          </h2>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1.1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}