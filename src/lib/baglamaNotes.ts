// Kısa Sap Bağlama (Kara Düzen: Alt Tel: La, Orta Tel: Re, Üst Tel: Sol)
// 19 Perde Haritası ve Makam Tanımları

export type StringName = "Alt Tel (La)" | "Orta Tel (Re)" | "Üst Tel (Sol)";

export type BaglamaFret = {
  fretNumber: number; // 0 = Açık tel, 1..19 = Perde Numarası
  noteName: string;   // Do, Re, Mi, Fa, Sol, La, Si vb.
  freqHz: number;     // Frekans (Hz)
  stringName: StringName;
  fingerHint: string; // 1. Parmak (İşaret), 2. Parmak (Orta), 3. Parmak (Yüzük), 4. Parmak (Serçe), Baş Parmak
};

export type BaglamaNoteItem = {
  id: string;
  timeSec: number;
  noteName: string;
  octave: number;
  freqHz: number;
  stringName: StringName;
  fretNumber: number;
  fingerHint: string;
  lyricsWord?: string;
};

export type MakamGenre = "halk" | "tsm" | "arabesk";

export const MAKAM_PRESETS: Record<
  MakamGenre,
  { name: string; desc: string; notes: string[]; defaultRoot: string }
> = {
  halk: {
    name: "Türk Halk Müziği (Hüseyni / Çargah Makamı)",
    desc: "Aşık tarzı, türküler ve bozlaklar için en yaygın bağlama makamı (Si bemol 2 kuralı).",
    notes: ["La", "Si-b2", "Do", "Re", "Mi", "Fa", "Sol"],
    defaultRoot: "La",
  },
  tsm: {
    name: "Türk Sanat Müziği (Nihavend / Rast Makamı)",
    desc: "Klasik Türk Müziği ve şarkı formundaki eserler için akıcı ve batı tınılı makam.",
    notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"],
    defaultRoot: "Do",
  },
  arabesk: {
    name: "Arabesk & Fantezi (Hicaz / Karcığar Makamı)",
    desc: "Duygusal, dokunaklı ve arabesk tınılar için Hicaz dizisi (Do# ve Si-b kuralı).",
    notes: ["La", "Si-b", "Do#", "Re", "Mi", "Fa", "Sol"],
    defaultRoot: "Re",
  },
};

// 12 Nota Frekans Tablosu (A4 = 440 Hz baz alınarak)
const NOTE_NAMES = [
  "Do",
  "Do#",
  "Re",
  "Re#",
  "Mi",
  "Fa",
  "Fa#",
  "Sol",
  "Sol#",
  "La",
  "La#",
  "Si",
];

// Otantik Türkü Notaları Kütüphanesi
export const TURKU_PRESETS: Record<
  string,
  { name: string; genre: MakamGenre; notes: string[]; words: string[] }
> = {
  gonul_dagi: {
    name: "Gönül Dağı (Neşet Ertaş)",
    genre: "halk",
    notes: [
      "La", "Si-b2", "Do", "Re", "Mi", "Mi", "Re", "Do",
      "Si-b2", "Do", "Re", "Do", "Si-b2", "La", "La", "La"
    ],
    words: [
      "Gönül", "dağı", "yağmur", "yağmur", "boran", "olunca", "akar", "düşer",
      "gözüm", "yaşı", "sel", "olur", "vov", "vov", "vov", "can"
    ],
  },
  uzun_ince: {
    name: "Uzun İnce Bir Yoldayım (Aşık Veysel)",
    genre: "halk",
    notes: [
      "Re", "Mi", "Fa", "Sol", "Fa", "Mi", "Re", "Do",
      "Si-b2", "Do", "Re", "Do", "Si-b2", "La", "La"
    ],
    words: [
      "Uzun", "ince", "bir", "yoldayım", "gidiyorum", "gündüz", "gece", "bilmiyorum",
      "ne", "haldeyim", "gidiyorum", "gündüz", "gece", "gece", "can"
    ],
  },
  mihriban: {
    name: "Mihriban (Musa Eroğlu)",
    genre: "halk",
    notes: [
      "La", "Do", "Re", "Mi", "Mi", "Fa", "Mi", "Re",
      "Do", "Re", "Mi", "Re", "Do", "Si-b2", "La"
    ],
    words: [
      "Sarı", "saçlarını", "deli", "gönlüme", "bağlamışım", "çözülmüyor", "Mihriban", "Mihriban",
      "Ayrılıktan", "zor", "belleme", "ölümü", "çözülmüyor", "Mihriban", "can"
    ],
  },
  sari_gelin: {
    name: "Sarı Gelin (Halk Müziği)",
    genre: "halk",
    notes: [
      "La", "Si-b2", "Do", "Re", "Re", "Do", "Si-b2", "La",
      "Do", "Re", "Mi", "Re", "Do", "Si-b2", "La"
    ],
    words: [
      "Erzurum", "çarşı", "pazar", "leyley", "sarı", "gelin", "sarı", "gelin",
      "Seni", "bana", "vermezler", "leyley", "sarı", "gelin", "can"
    ],
  },
};

// Kısa Sap Bağlama Kara Düzen (Alt Tel: La3 ~220Hz, Orta Tel: Re3 ~146.8Hz, Üst Tel: Sol2 ~98Hz)
export function getBaglamaFretForNote(
  noteNameClean: string,
  octave: number
): { stringName: StringName; fretNumber: number; fingerHint: string } {
  const normNote = noteNameClean.trim();

  // Kısa sap bağlamada en çok kullanılan perdeler (Alt Tel Öncelikli)
  const altTelMap: Record<string, { fret: number; finger: string }> = {
    La: { fret: 0, finger: "Açık Tel (Tezene)" },
    "Si-b2": { fret: 1, finger: "1. Parmak (İşaret)" },
    "Si-b": { fret: 1, finger: "1. Parmak (İşaret)" },
    Si: { fret: 2, finger: "2. Parmak (Orta)" },
    Do: { fret: 3, finger: "3. Parmak (Yüzük)" },
    "Do#": { fret: 4, finger: "4. Parmak (Serçe)" },
    Re: { fret: 5, finger: "1. Parmak (İşaret)" },
    "Re#": { fret: 6, finger: "2. Parmak (Orta)" },
    Mi: { fret: 7, finger: "3. Parmak (Yüzük)" },
    Fa: { fret: 8, finger: "1. Parmak (İşaret)" },
    "Fa#": { fret: 9, finger: "2. Parmak (Orta)" },
    Sol: { fret: 10, finger: "3. Parmak (Yüzük)" },
    "Sol#": { fret: 11, finger: "4. Parmak (Serçe)" },
  };

  if (altTelMap[normNote]) {
    return {
      stringName: "Alt Tel (La)",
      fretNumber: altTelMap[normNote].fret,
      fingerHint: altTelMap[normNote].finger,
    };
  }

  // Pes notalar için Orta Tel (Re) veya Üst Tel (Sol)
  const ortaTelMap: Record<string, { fret: number; finger: string }> = {
    Re: { fret: 0, finger: "Açık Tel (Tezene)" },
    "Re#": { fret: 1, finger: "1. Parmak (İşaret)" },
    Mi: { fret: 2, finger: "1. Parmak (İşaret)" },
    Fa: { fret: 3, finger: "2. Parmak (Orta)" },
    "Fa#": { fret: 4, finger: "3. Parmak (Yüzük)" },
    Sol: { fret: 5, finger: "1. Parmak (İşaret)" },
    "Sol#": { fret: 6, finger: "2. Parmak (Orta)" },
  };

  if (ortaTelMap[normNote]) {
    return {
      stringName: "Orta Tel (Re)",
      fretNumber: ortaTelMap[normNote].fret,
      fingerHint: ortaTelMap[normNote].finger,
    };
  }

  return {
    stringName: "Alt Tel (La)",
    fretNumber: 3,
    fingerHint: "1. Parmak (İşaret)",
  };
}

// Hz Frekanstan Nota İsmi ve Oktav Bulma
export function frequencyToNote(freqHz: number): {
  noteName: string;
  octave: number;
  centsOff: number;
} {
  const midiNote = Math.round(69 + 12 * Math.log2(freqHz / 440));
  const exactMidi = 69 + 12 * Math.log2(freqHz / 440);
  const centsOff = Math.round((exactMidi - midiNote) * 100);

  const noteIndex = ((midiNote % 12) + 12) % 12;
  const octave = Math.floor(midiNote / 12) - 1;

  return {
    noteName: NOTE_NAMES[noteIndex],
    octave,
    centsOff,
  };
}

// Nota İsminden Frekans (Hz) Bulma
export function noteToFrequency(noteName: string, octave: number = 3): number {
  const clean = noteName.replace("-b2", "").replace("-b", "#");
  let idx = NOTE_NAMES.indexOf(clean);
  if (idx === -1) idx = 0; // Do
  const midiNote = (octave + 1) * 12 + idx;
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// Yarım ses Transpoze (Note Transposition)
export function transposeNote(noteName: string, semitones: number): string {
  const isB2 = noteName.includes("-b2");
  const clean = noteName.replace("-b2", "").replace("-b", "#");
  let idx = NOTE_NAMES.indexOf(clean);
  if (idx === -1) return noteName;

  let newIdx = (idx + semitones) % 12;
  if (newIdx < 0) newIdx += 12;

  let result = NOTE_NAMES[newIdx];
  if (isB2 && result === "Si") result = "Si-b2";
  return result;
}

// Notaları Makam Gamına Oturtma & Rasgele Gürültü Sıçramalarını Temizleme
export function snapNotesToMakam(
  notesList: BaglamaNoteItem[],
  genre: MakamGenre
): BaglamaNoteItem[] {
  const scaleNotes = MAKAM_PRESETS[genre].notes;

  return notesList.map((item) => {
    if (scaleNotes.includes(item.noteName)) {
      return item;
    }

    let bestNote = scaleNotes[0];
    let minDiff = 999;

    const currentMIDI = NOTE_NAMES.indexOf(item.noteName.replace("-b2", "").replace("-b", "#"));

    for (const scaleNote of scaleNotes) {
      const cleanScale = scaleNote.replace("-b2", "").replace("-b", "#");
      const scaleMIDI = NOTE_NAMES.indexOf(cleanScale);
      if (scaleMIDI !== -1 && currentMIDI !== -1) {
        const diff = Math.abs(currentMIDI - scaleMIDI);
        if (diff < minDiff) {
          minDiff = diff;
          bestNote = scaleNote;
        }
      }
    }

    const fretInfo = getBaglamaFretForNote(bestNote, item.octave);
    return {
      ...item,
      noteName: bestNote,
      freqHz: noteToFrequency(bestNote, item.octave),
      stringName: fretInfo.stringName,
      fretNumber: fretInfo.fretNumber,
      fingerHint: fretInfo.fingerHint,
    };
  });
}

// Melodideki Gürültü Sıçramalarını Yumuşatıp Akıcı Müzikal Diziye Dönüştürme (Median & Duration Filtering)
export function smoothAndFilterMelodyNotes(
  notesList: BaglamaNoteItem[],
  genre: MakamGenre
): BaglamaNoteItem[] {
  if (notesList.length <= 2) return notesList;

  // 1. Önce makama oturt
  const snapped = snapNotesToMakam(notesList, genre);

  // 2. Ardışık aynı notaları birleştir ve çok kısa süreli parazit sıçramalarını filtresi
  const smoothed: BaglamaNoteItem[] = [];

  for (let i = 0; i < snapped.length; i++) {
    const current = snapped[i];
    const prev = smoothed[smoothed.length - 1];

    if (!prev) {
      smoothed.push(current);
      continue;
    }

    // Eğer aynı notaysa veya ardışık sıçrama çok kısaysa birleştir
    if (current.noteName === prev.noteName) {
      // Birleştir, ekleme
      continue;
    }

    // 3'lü pencerede tek karelik gürültü sıçraması kontrolü (Sıçrama t1 -> t2 -> t1)
    const next = snapped[i + 1];
    if (next && next.noteName === prev.noteName && current.noteName !== prev.noteName) {
      // Bu kare tek karelik geçici parazit, atla
      continue;
    }

    smoothed.push(current);
  }

  return smoothed;
}

// Örnek Melodi Jeneratörü
export function generateSampleMelody(genre: MakamGenre): BaglamaNoteItem[] {
  const preset = TURKU_PRESETS.gonul_dagi;
  const baseNotes = preset.notes;
  const sampleWords = preset.words;

  return baseNotes.map((note, i) => {
    const fretInfo = getBaglamaFretForNote(note, 3);
    return {
      id: `sample_${i}_${Date.now()}`,
      timeSec: i * 0.8,
      noteName: note,
      octave: 3,
      freqHz: noteToFrequency(note, 3),
      stringName: fretInfo.stringName,
      fretNumber: fretInfo.fretNumber,
      fingerHint: fretInfo.fingerHint,
      lyricsWord: sampleWords[i % sampleWords.length],
    };
  });
}
