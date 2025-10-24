"use client";
// import SocialBrowserDetector from "@/components/SocialBrowserDetector";
import SocialBrowserDetector from "unsocial";

import QuranRedirectInfo from "@/components/QuranRedirectInfo";
import { useState, useEffect } from "react";
import { usePlausible } from "next-plausible";

export default function QuranAyah() {
  const [inputValue, setInputValue] = useState("2:21");
  const [surahAyah, setSurahAyah] = useState("2:21");
  const [ayahData, setAyahData] = useState(null);
  const [brackets, setBrackets] = useState(true);
  const [ref, setRef] = useState(true);

  const plausible = usePlausible();

  useEffect(() => {
    const fetchAyah = async () => {
      const [surah, ayah] = surahAyah.split(":");

      try {
        // Fetch Bengali translation
        const localhost = "http://localhost:3000";
        const remotehost = "https://api.quran.bid";
        const apiUrl =
          process.env.NEXT_PUBLIC_NODE_ENV === "dev" ? localhost : remotehost;
        const bengaliRes = await fetch(
          `${apiUrl}/surah/${surah}/ayah/${ayah}?ref=${ref}`
        );
        const bengaliData = await bengaliRes.json();

        // Fetch Arabic text from Quran.com API
        const arabicRes = await fetch(
          `https://api.quran.com/api/v4/quran/verses/indopak?verse_key=${surah}:${ayah}`
        );
        const arabicData = await arabicRes.json();

        if (bengaliData.error) {
          console.error("Error:", bengaliData.error);
          return;
        }

        setAyahData({
          ...bengaliData,
          arabic: arabicData.verses?.[0]?.text_indopak || "",
        });
      } catch (error) {
        console.error("Error fetching ayah:", error);
      }
    };

    fetchAyah();
  }, [surahAyah, ref]);

  const handleSubmit = () => {
    plausible("search-ayah");
    setSurahAyah(inputValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const formatTranslation = (text) => {
    let formattedText = text;

    // Remove brackets and their content if brackets is false
    if (!brackets) {
      formattedText = formattedText.replace(/\s*\([^)]+\)\s*/g, " ").trim();
    }

    // Handle reference numbers
    if (!ref) {
      formattedText = formattedText.replace(/\[([\d০-৯]+)\]/g, "");
    } else {
      formattedText = formattedText.replace(
        /\[([\d০-৯]+)\]/g,
        (_, num) => `<sup>${num}</sup>`
      );
    }

    return formattedText;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 border rounded shadow-lg text-center bg-white dark:bg-gray-800">
      <SocialBrowserDetector />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        {" "}
        কোরআনুল কারীমের তারজুমানী{" "}
      </h1>
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        {" "}
        মাওলানা আবু তাহের মেছবাহ{" "}
      </h2>
      <p className="text-green-600 dark:text-green-400">
        {" "}
        শুধু দুটি আয়াত আছে, 2:15 এবং 2:21{" "}
      </p>
      <div className="flex mb-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="p-2 border rounded-l text-center flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="Enter Surah:Ayah (e.g., 2:15)"
        />
        <button
          onClick={() => {
            plausible("go-button");
            handleSubmit();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
        >
          Go
        </button>
      </div>

      {ayahData && (
        <>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {ayahData.arabic}
          </h2>
          <p
            className="text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{
              __html: formatTranslation(ayahData.translation),
            }}
          ></p>

          {ref && ayahData.references?.length > 0 && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-left border-t pt-2">
              {/* <strong>References:</strong> */}
              <ul className="pl-5 list-none">
                {ayahData.references.map((r, index) => {
                  const refNumber = ayahData.translation
                    .match(/\[([\d০-৯]+)\]/g)
                    [index]?.replace(/[\[\]]/g, "");
                  return (
                    <li key={index}>
                      <sup>{refNumber}</sup> {r}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}

      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => {
            plausible("toggle-brackets");
            setBrackets(!brackets);
          }}
          className={`px-4 py-2 border rounded ${
            brackets
              ? "bg-blue-500 text-white"
              : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
          }`}
        >
          {brackets ? "Brackets ON" : "Brackets OFF"}
        </button>

        <button
          onClick={() => {
            plausible("toggle-ref");
            setRef(!ref);
          }}
          className={`px-4 py-2 border rounded ${
            ref
              ? "bg-blue-500 text-white"
              : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
          }`}
        >
          {ref ? "Ref ON" : "Ref OFF"}
        </button>
      </div>
      <p className="mt-4 text-gray-700 dark:text-gray-300">
        {" "}
        Developed by{" "}
        <a
          className="text-blue-600 dark:text-blue-300"
          href="https://wa.me/8801832776884"
          onClick={() => plausible("contact-whatsapp")}
        >
          {" "}
          Zubair Ibn Zamir
        </a>{" "}
      </p>
      <br />
      <br />
      <QuranRedirectInfo />
    </div>
  );
}
