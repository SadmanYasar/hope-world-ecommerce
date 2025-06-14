import React from "react";

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin">
            <div className="absolute inset-0 rounded-full opacity-0 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
          </div>
          <div className="absolute top-0 left-0 w-16 h-16 rounded-full animate-spin">
            <div
              className="w-full h-full rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 270deg, #fbbf24 270deg, #f59e0b 360deg)",
                mask: "radial-gradient(circle, transparent 50%, black 50%, black 62.5%, transparent 62.5%)",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
