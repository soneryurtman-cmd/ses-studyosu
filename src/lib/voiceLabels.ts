// ElevenLabs ses etiketlerini (İngilizce) Türkçeye çevirir.

const DICT: Record<string, string> = {
  // Cinsiyet
  male: "erkek",
  female: "kadın",
  "non-binary": "nötr",
  neutral: "nötr",

  // Yaş
  young: "genç",
  "middle-aged": "orta yaşlı",
  "middle aged": "orta yaşlı",
  old: "yaşlı",
  senior: "yaşlı",

  // Aksan / dil
  american: "Amerikan",
  british: "İngiliz",
  australian: "Avustralya",
  irish: "İrlanda",
  "us-southern": "Güney ABD",
  transatlantic: "transatlantik",
  swedish: "İsveç",
  indian: "Hint",
  english: "İngilizce",

  // Karakter / ton
  calm: "sakin",
  "well-rounded": "dengeli",
  confident: "kendinden emin",
  crisp: "net",
  warm: "sıcak",
  soft: "yumuşak",
  deep: "kalın",
  raspy: "boğuk",
  hoarse: "çatlak",
  gentle: "nazik",
  friendly: "samimi",
  pleasant: "hoş",
  smooth: "pürüzsüz",
  strong: "güçlü",
  authoritative: "otoriter",
  professional: "profesyonel",
  casual: "gündelik",
  expressive: "etkili",
  energetic: "enerjik",
  cheerful: "neşeli",
  upbeat: "canlı",
  excited: "heyecanlı",
  serious: "ciddi",
  sad: "hüzünlü",
  emotional: "duygusal",
  mature: "olgun",
  intense: "yoğun",
  meditative: "sakinleştirici",
  articulate: "anlaşılır",
  natural: "doğal",
  clear: "berrak",
  wise: "bilge",
  childish: "çocuksu",
  seductive: "baştan çıkarıcı",
  formal: "resmi",
  relaxed: "rahat",
  husky: "kısık",
  bright: "parlak",
  velvety: "kadifemsi",

  // Kullanım amacı
  narration: "anlatım",
  "narrative & story": "anlatı & hikâye",
  "news": "haber",
  "news presenter": "haber sunucusu",
  conversational: "sohbet",
  "characters & animation": "karakter & animasyon",
  "social media": "sosyal medya",
  "audiobook": "sesli kitap",
  "informative-educational": "bilgilendirici-eğitici",
  entertainment: "eğlence",
  advertisement: "reklam",
  "video games": "video oyunları",
  meditation: "meditasyon",
  storytelling: "hikâye anlatımı",
};

export function trLabel(value: string): string {
  if (!value) return value;
  const key = value.toLowerCase().trim();
  if (DICT[key]) return DICT[key];
  // "american english" gibi birleşikleri kelime kelime çevir
  const words = key.split(/[\s_-]+/);
  const translated = words.map((w) => DICT[w] || w);
  // Eğer hiçbir kelime çevrilmediyse orijinali döndür
  return translated.join(" ");
}

// Bir ses için Türkçe etiket özeti üretir
export function voiceSummaryTr(labels: Record<string, string>): string {
  const order = ["gender", "age", "accent", "description", "use_case"];
  const parts: string[] = [];
  for (const k of order) {
    if (labels[k]) parts.push(trLabel(labels[k]));
  }
  // Sıralamada olmayan diğer etiketleri de ekle
  for (const [k, v] of Object.entries(labels)) {
    if (!order.includes(k) && v) parts.push(trLabel(v));
  }
  return parts.filter(Boolean).join(" · ");
}
