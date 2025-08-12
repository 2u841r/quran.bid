"use client";

import React, { useState, useEffect } from "react";

// So your user can see the popup when they open the page in a social media app's internal browser
// This component detects if the user is in a social media app's browser

interface SocialBrowserDetectorProps {
  className?: string;
}

const SocialBrowserDetector: React.FC<SocialBrowserDetectorProps> = ({
  className = "",
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [detectedApp, setDetectedApp] = useState<string>("");

  useEffect(() => {
    const detectSocialBrowser = () => {
      const userAgent = navigator.userAgent;

      let appName = "";

      // Instagram Browser - Check first as it's most specific
      if (userAgent.includes("Instagram")) {
        appName = "Instagram";
      }
      // Facebook/Messenger Browser - FB_IAB indicates Facebook family apps
      else if (userAgent.includes("FB_IAB")) {
        appName = "Facebook/Meta App";
      }
      // Facebook iOS Browser
      else if (userAgent.includes("FBAN/FBIOS")) {
        appName = "Facebook App (iOS)";
      }
      // Generic Facebook indicators
      else if (userAgent.includes("FBAV")) {
        appName = "Facebook/Meta App";
      }

      if (appName) {
        setDetectedApp(appName);
        setShowPopup(true);
      }
    };

    // Only run on client side
    if (typeof window !== "undefined") {
      detectSocialBrowser();

      // for DEBUG/testing/styling, uncomment these 2 lines: 

      // setDetectedApp("Debug Mode");
      // setShowPopup(true);

    }
  }, []);

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && window.location.href) {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.log("Failed to copy link:", err);
    }
    setShowPopup(false);
  };

  // Don't render on server side
  if (typeof window === "undefined") return null;

  if (!showPopup) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 ${className}`}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Open in External Browser
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            aria-label="Close popup"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 text-sm mb-4">
            You&apos;re viewing this page in <strong>{detectedApp}</strong>
            &apos;s internal browser. For the best experience, please open this
            page in your default browser.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm font-medium mb-3 flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              How to open in external browser:
            </p>
            <ol className="text-blue-700 text-sm space-y-2">
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                  1
                </span>
                <span>
                  Tap the <strong>three dots (⋯)</strong> in the top right
                  corner
                </span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">
                  2
                </span>
                <span>
                  Select <strong>&quot;Open in External Browser&quot;</strong> or{" "}
                  <strong>&quot;Open in Chrome / Safari&quot;</strong>
                </span>
              </li>
            </ol>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* <button
            onClick={handleCopyLink}
            className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Link
          </button> */}
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gray-200 active:bg-gray-300 transition-colors"
          >
            Continue Here
          </button>
        </div>
      </div>
    </div>
  );
};

export default SocialBrowserDetector;


// more from some GH Gist, not sure if fb/meta still use/show this 
// Mozilla/5.0 (iPad; CPU OS 8_4_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12H321 [FBAN/FBIOS;FBAV/38.0.0.6.79;FBBV/14316658;FBDV/iPad4,1;FBMD/iPad;FBSN/iPhone OS;FBSV/8.4.1;FBSS/2; FBCR/;FBID/tablet;FBLC/en_US;FBOP/1]
// "Mozilla/5.0 (iPad; CPU OS 8_4_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Mobile/12H321 [FBAN/FBIOS;FBAV/38.0.0.6.79;FBBV/14316658;FBDV/iPad4,1;FBMD/iPad;FBSN/iPhone OS;FBSV/8.4.1;FBSS/2; FBCR/;FBID/tablet;FBLC/en_US;FBOP/1]"