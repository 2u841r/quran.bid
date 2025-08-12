const quran = {
    "2": {
        "15": {
            arabic: "اَللّٰهُ يَسۡتَهۡزِئُ بِهِمۡ وَيَمُدُّهُمۡ فِىۡ طُغۡيَانِهِمۡ يَعۡمَهُوۡنَ‏",
            base_translation: ["আসলে", "আল্লাহ", "তাদের", "সঙ্গে", "মজা", "করছেন,", "আর", "তিনি", "তাদের", "ঢিল", "ছাড়/সুযোগ", "দিচ্ছেন", "যাতে", "নিজেদের", "হঠকারিতায়", "তারা", "ঘোরপাক", "খেতে", "থাকে।"],
            brackets: [
                { word: "আসলে", position: 0 },
                { word: "ছাড়/সুযোগ", position: 10 }
            ],
            references: [
                { number: 8, position: 5, text: "আসলে আল্লাহ তাদের মজা করার পরিণামের দিকে নিয়ে যাচ্ছেন।" },
                { number: 9, position: 18, text: "অনুবাদটি এভাবে ___ করা যেত" }
            ]
        },
        "21": {
            "arabic": "يٰۤاَيُّهَا النَّاسُ اعۡبُدُوۡا رَبَّكُمُ الَّذِىۡ خَلَقَكُمۡ وَالَّذِيۡنَ مِنۡ قَبۡلِكُمۡ لَعَلَّكُمۡ تَتَّقُوۡنَ ۙ‏",
            "base_translation": ["হে", "লোকসকল,", "তোমরা", "আপন", "রবের", "ইবাদত", "কর,", "যিনি", "তোমাদের", "সৃষ্টি", "করেছেন", "এবং", "সৃষ্টি করেছেন", "তাদের", "যারা", "তোমাদের", "আগে", "বিগত", "হয়েছে।", "ইবাদত করো,", "যাতে", "তোমরা", "মুক্তাক্বী", "হতে", "পারো।"],
            "brackets": [
                { word: "সৃষ্টি করেছেন", position: 12 },
                { word: "ইবাদত করো,", position: 19 }
            ],
            references: [
                { number: 10, position: 24, text: "আসলে আল্লাহ তাদের মজা করার পরিণামের দিকে নিয়ে যাচ্ছেন।" },
            ]
        }
    }
};

const toBengaliNum = num => num.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);

export async function GET(request, { params }) {
    const { surah, ayah } = await params;
    const { searchParams } = new URL(request.url);
    const brackets = searchParams.get('brackets') !== "false";
    const ref = searchParams.get('ref') !== "false";

    if (!quran[surah] || !quran[surah][ayah]) {
        return Response.json({ error: "Ayah not found" }, { status: 404 });
    }

    let words = [...quran[surah][ayah].base_translation];

    // Handle brackets
    let removedIndexes = new Set();
    if (brackets) {
        quran[surah][ayah].brackets.forEach(({ word, position }) => {
            words[position] = `(${word})`;
        });
    } else {
        quran[surah][ayah].brackets.forEach(({ position }) => removedIndexes.add(position));
    }

    // Handle references
    let references = [];
    if (ref) {
        quran[surah][ayah].references.forEach(({ number, position, text }) => {
            let bengaliNumber = toBengaliNum(number);

            let refPosition = position;
            while (removedIndexes.has(refPosition)) {
                refPosition++;
            }

            if (words[refPosition] && words[refPosition].endsWith(",")) {
                words[refPosition] = words[refPosition].replace(",", `[${bengaliNumber}],`);
            } else if (words[refPosition]) {
                words[refPosition] += `[${bengaliNumber}]`;
            }

            references.push(`${bengaliNumber}: ${text}`);
        });
    }

    // Remove words only after references are added
    if (!brackets) {
        words = words.filter((_, index) => !removedIndexes.has(index));
    }

    return Response.json({
        arabic: quran[surah][ayah].arabic,
        translation: words.join(" "),
        references: ref ? references : undefined
    });
}