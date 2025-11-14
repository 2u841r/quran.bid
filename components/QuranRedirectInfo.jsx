"use client";
import Link from "next/link";
import { quranData, slugToChapter } from "../app/utils/quran-utils";
import { useState, useEffect } from "react";

export default function QuranRedirectInfo() {
  const [currentSlugIndex, setCurrentSlugIndex] = useState(0);

  // Al-Kahf slug variations
  const kahfSlugs = [
    "kahf",
    "khf",
    "kahaf",
    "alkahaf",
    "alkahf",
    "alkhaf",
    "alkhf",
    "al-kahf",
    "al-kahaf",
    "cave",
    "kaf",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlugIndex((prevIndex) => (prevIndex + 1) % kahfSlugs.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
    <div className="max-w-4xl mx-auto p-2">
      <div className="text-center mb-2">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-300 mb-4">
          Quran Redirect Server
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          কুরআনের আয়াত খোঁজার সহজ মাধ্যম।
        </p>
        <p className="text-gray-700 dark:text-gray-200">
          quran.com থেকে লিংকের মাধ্যমে কোনো সূরার কোনো আয়াত খুঁজে পেতে চাইলে
          সূরা নম্বর জানা থাকতে হয়- যেমন সূরা কাহাফের ৬০ নম্বর আয়াত খুঁজে পেতে
          https://quran.com/18/60 <br /> কিন্তু সূরা নম্বর তো মুখস্থ রাখা কঠিন,
          তাই এটি বানালাম। সূরা নম্বর না লিখে kahf, khf, alkahf, alkahaf,
          al-kahaf যাই ভিজিট করেন না কেন, আপনি সঠিক সূরায় পৌছে যাবেন। যেমনঃ{" "}
          <br /> <br />
          <Link
            href={`/${kahfSlugs[currentSlugIndex]}/60`}
            target="_blank"
            rel="noopener noreferrer"
            prefetch={false}
            className="block"
          >
            <code className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-blue-600 dark:text-blue-400 font-mono transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
              quran.bid/{kahfSlugs[currentSlugIndex]}/60
            </code>
          </Link>
          <br />
          <p>
            {" "}
            তারপরও আপনি যদি কোনো সম্ভাব্য বানান ব্যবহার করতে না পারেন, উপরের
            হোয়াটস অ্যাপ নম্বরে জানালে ফিক্স করে দেব। গিটহাবে অ্যাকাউণ্ট
            খুলে/লগিন করে আপনি নিজেও ঠিক করতে পারবেন{" "}
            <Link
              className="text-blue-600 dark:text-blue-500"
              href="https://github.com/2u841r/quran.bid/blob/main/app/quran.js"
            >
              {" "}
              এই লিংকে ভিজিট করে।{" "}
            </Link>{" "}
            ।
          </p>
        </p>
      </div>

      <div className="bg-gray-100 dark:bg-gray-500 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-800">
          API Endpoints
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-800 mb-2">
              Get All Chapters
            </h3>
            <code className="bg-gray-200 dark:bg-gray-300 text-blue-600 dark:text-blue-500 px-3 py-2 rounded text-sm">
              GET{" "}
              <Link href={`/api/chapters`} prefetch={false}>
                {" "}
                /api/chapters{" "}
              </Link>{" "}
            </code>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-800 mb-2">
              Search by Slug
            </h3>
            <code className="bg-gray-200 dark:bg-gray-300 text-blue-600 dark:text-blue-500 px-3 py-2 rounded text-sm">
              GET{" "}
              <Link href={`/api/search/bqrh`} prefetch={false}>
                {" "}
                /api/search/[অনুসন্ধান]{" "}
              </Link>{" "}
            </code>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-500">
          Try visiting any of these URLs to see the redirect in action:
        </p>
        <div className="mt-4 space-y-2">
          <Link
            href="/baqarah/1"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            /baqarah/1
          </Link>
          <br />
          <Link
            href="/fatihah"
            className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            /fatihah
          </Link>
          <br />
          <Link
            href="/ya-sin/83"
            className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
          >
            /ya-sin/83
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
