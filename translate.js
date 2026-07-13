const fs = require('fs');

// زمانێن مەبەست بۆ وەرگێڕانێ (ckb بۆ سۆرانی، ku بۆ بادینی/کرمانجی)
const targetLangs = {
    'ckb': 'subtitles_ckb.vtt',
    'ku': 'subtitles_ku.vtt'
};

async function translateText(text, targetLang) {
    if (!text.trim()) return '';
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data && data[0]) {
            return data[0].map(x => x[0] || "").join("").trim();
        }
    } catch (error) {
        console.error(`Translation failed for: ${text}`, error);
    }
    return text; // Fallback
}

async function processVTT() {
    if (!fs.existsSync('subtitles.vtt')) {
        console.error('subtitles.vtt not found!');
        return;
    }

    const vttContent = fs.readFileSync('subtitles.vtt', 'utf8');
    const lines = vttContent.split(/\r?\n/);

    for (const [lang, filename] of Object.entries(targetLangs)) {
        console.log(`Translating to ${lang}...`);
        const translatedLines = [];

        for (let line of lines) {
            const trimmed = line.trim();
            // پاراستنا هێڵێن کات و ناونیشانان یێن VTT
            if (trimmed === 'WEBVTT' || trimmed === '' || !isNaN(trimmed) || trimmed.includes('-->')) {
                translatedLines.push(line);
            } else {
                // تەرجەمەکرنا دەقی ب شێوەیەکێ داینامیکی
                const translated = await translateText(line, lang);
                translatedLines.push(translated);
                // تێپەڕاندنا کاتەکی بۆ ڕێگریکردن ل بلۆکبوونا لایێ گوگل
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }

        fs.writeFileSync(filename, translatedLines.join('\n'), 'utf8');
        console.log(`Saved: ${filename}`);
    }
}

processVTT();
