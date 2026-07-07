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
    notes: ["Do", "Re", "Mi-b", "Fa", "Sol", "La-b", "Si-b"],
    defaultRoot: "Do",
  },
  arabesk: {
    name: "Arabesk & Fantezi (Hicaz / Karcığar Makamı)",
    desc: "Duygusal, dokunaklı ve arabesk tınılar için Hicaz dizisi (Bakiye diyez / bemol).",
    notes: ["LA", "Si-b", "Do#", "Re", "Mi", "Fa", "Sol"],
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

// Kısa Sap Bağlama Kara Düzen (Alt Tel: La3 ~220Hz, Orta Tel: Re3 ~146.8Hz, Üst Tel: Sol2 ~98Hz)
export function getBaglamaFretForNote(
  noteNameClean: string,
  octave: number
): { stringName: StringName; fretNumber: number; fingerHint: string } {
  const normNote = noteNameClean.trim();

  // Kısa sap bağlamada en çok kullanılan perdeler (Alt Tel Öncelikli)
  // Alt Tel (La3 - 220Hz): Perde 0=La, 1=Si-b2, 2=Si, 3=Do, 4=Do#, 5=Re, 6=Re#, 7=Mi, 8=Fa, 9=Fa#, 10=Sol, 11=Sol#, 12=La
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

  // Eğer notasını bulabilirsek Alt Tel'den ver
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

  // Varsayılan açık tel / 3. perde
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
  // MIDI Note = 69 + 12 * log2(freq / 440)
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

// Örnek Melodi Jeneratörü (AI veya yüklü şarkı olmadığında örnek eser için)
export function generateSampleMelody(genre: MakamGenre): BaglamaNoteItem[] {
  const baseNotes =
    genre === "halk"
      ? ["La", "Si-b2", "Do", "Re", "Mi", "Re", "Do", "Si-b2", "La"]
      : genre === "tsm"
      ? ["Do", "Re", "Mi", "Fa", "Sol", "Fa", "Mi", "Re", "Do"]
      : ["Re", "Mi", "Fa#", "Sol", "La", "Sol", "Fa#", "Mi", "Re"];

  const sampleWords = [
    "Gönül",
    "Dağı",
    "Yüce",
    "Olur",
    "Bitecektir",
    "Bu",
    "Huzur",
    "Gözlerin",
    "Sözlerin",
  ];

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
