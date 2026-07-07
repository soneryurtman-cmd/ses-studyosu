// Kısa Sap Bağlama (Kara Düzen: Alt Tel: La3 220Hz, Orta Tel: Re3 146.8Hz, Üst Tel: Sol2 98Hz)
// 19 Perde Haritası, Otantik Türkü Notaları ve Ritmsel Nota Süreleri

export type StringName = "Alt Tel (La)" | "Orta Tel (Re)" | "Üst Tel (Sol)";

export type BaglamaNoteItem = {
  id: string;
  timeSec: number;
  noteName: string;
  octave: number;
  freqHz: number;
  stringName: StringName;
  fretNumber: number;
  fingerHint: string;
  durationBeats: number; // Ritmsel Süre (0.5 = Sekizlik, 1.0 = Dörtlük, 1.5 = Noktalı)
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

// Otantik ve Ritmsel Türkü Notaları Kütüphanesi
export const TURKU_PRESETS: Record<
  string,
  {
    name: string;
    genre: MakamGenre;
    items: Array<{ note: string; dur: number; word: string }>;
  }
> = {
  gonul_dagi: {
    name: "Gönül Dağı (Neşet Ertaş)",
    genre: "halk",
    items: [
      { note: "La", dur: 0.5, word: "Gö" },
      { note: "Si-b2", dur: 0.5, word: "nül" },
      { note: "Do", dur: 1.0, word: "da" },
      { note: "Re", dur: 1.0, word: "ğı" },
      { note: "Mi", dur: 1.5, word: "yağ" },
      { note: "Mi", dur: 0.5, word: "mur" },
      { note: "Re", dur: 0.5, word: "bo" },
      { note: "Do", dur: 0.5, word: "ran" },
      { note: "Si-b2", dur: 0.5, word: "o" },
      { note: "Do", dur: 0.5, word: "lun" },
      { note: "Re", dur: 1.0, word: "ca" },
      { note: "Do", dur: 0.5, word: "a" },
      { note: "Si-b2", dur: 0.5, word: "kar" },
      { note: "La", dur: 2.0, word: "düşer" },
      { note: "Si-b2", dur: 0.5, word: "göz" },
      { note: "Do", dur: 0.5, word: "üm" },
      { note: "Re", dur: 1.0, word: "ya" },
      { note: "Do", dur: 0.5, word: "şı" },
      { note: "Si-b2", dur: 0.5, word: "sel" },
      { note: "La", dur: 2.0, word: "olur" },
    ],
  },
  uzun_ince: {
    name: "Uzun İnce Bir Yoldayım (Aşık Veysel)",
    genre: "halk",
    items: [
      { note: "Re", dur: 0.5, word: "U" },
      { note: "Mi", dur: 0.5, word: "zun" },
      { note: "Fa", dur: 1.0, word: "in" },
      { note: "Sol", dur: 1.0, word: "ce" },
      { note: "Fa", dur: 0.5, word: "bir" },
      { note: "Mi", dur: 0.5, word: "yol" },
      { note: "Re", dur: 1.0, word: "da" },
      { note: "Do", dur: 1.0, word: "yım" },
      { note: "Si-b2", dur: 0.5, word: "gi" },
      { note: "Do", dur: 0.5, word: "di" },
      { note: "Re", dur: 1.0, word: "yo" },
      { note: "Do", dur: 0.5, word: "rum" },
      { note: "Si-b2", dur: 0.5, word: "gün" },
      { note: "La", dur: 1.5, word: "düz" },
      { note: "La", dur: 1.5, word: "gece" },
    ],
  },
  mihriban: {
    name: "Mihriban (Musa Eroğlu)",
    genre: "halk",
    items: [
      { note: "La", dur: 0.5, word: "Sa" },
      { note: "Do", dur: 0.5, word: "rı" },
      { note: "Re", dur: 1.0, word: "saç" },
      { note: "Mi", dur: 1.0, word: "la" },
      { note: "Mi", dur: 0.5, word: "rı" },
      { note: "Fa", dur: 0.5, word: "nı" },
      { note: "Mi", dur: 1.0, word: "de" },
      { note: "Re", dur: 1.0, word: "li" },
      { note: "Do", dur: 0.5, word: "gön" },
      { note: "Re", dur: 0.5, word: "lü" },
      { note: "Mi", dur: 1.0, word: "me" },
      { note: "Re", dur: 0.5, word: "bağ" },
      { note: "Do", dur: 0.5, word: "la" },
      { note: "Si-b2", dur: 1.0, word: "mı" },
      { note: "La", dur: 2.0, word: "şım" },
    ],
  },
  sari_gelin: {
    name: "Sarı Gelin (Halk Müziği)",
    genre: "halk",
    items: [
      { note: "La", dur: 0.5, word: "Er" },
      { note: "Si-b2", dur: 0.5, word: "zu" },
      { note: "Do", dur: 1.0, word: "rum" },
      { note: "Re", dur: 1.5, word: "çar" },
      { note: "Re", dur: 0.5, word: "şı" },
      { note: "Do", dur: 0.5, word: "pa" },
      { note: "Si-b2", dur: 0.5, word: "zar" },
      { note: "La", dur: 2.0, word: "ley" },
      { note: "Do", dur: 0.5, word: "sa" },
      { note: "Re", dur: 0.5, word: "rı" },
      { note: "Mi", dur: 1.0, word: "ge" },
      { note: "Re", dur: 1.0, word: "lin" },
      { note: "Do", dur: 0.5, word: "sa" },
      { note: "Si-b2", dur: 0.5, word: "rı" },
      { note: "La", dur: 2.0, word: "gelin" },
    ],
  },
};

// Kısa Sap Bağlama Alt Tel Doğru Nota ve Perde Eşleşmesi
export function getBaglamaFretForNote(
  noteNameClean: string,
  octave: number = 3
): { stringName: StringName; fretNumber: number; fingerHint: string } {
  const normNote = noteNameClean.trim();

  // Alt Tel (La3 - 220Hz Başlangıçlı):
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

  // Pes Notalar İçin Orta Tel (Re)
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

// Kısa Sap Bağlama Doğru Melodik Frekans Hesabı (Hz)
export function noteToFrequency(noteName: string, octave: number = 3): number {
  const isB2 = noteName.includes("-b2");
  const clean = noteName.replace("-b2", "").replace("-b", "#");
  let idx = NOTE_NAMES.indexOf(clean);
  if (idx === -1) idx = 0;

  // Kısa Sap Bağlama Dizisi:
  // La3 = 220Hz (MIDI 57)
  // Si-b2 = 233.08Hz (MIDI 58)
  // Si3 = 246.94Hz (MIDI 59)
  // Do4 = 261.63Hz (MIDI 60)
  // Do#4 = 277.18Hz (MIDI 61)
  // Re4 = 293.66Hz (MIDI 62)
  // Mi4 = 329.63Hz (MIDI 64)
  // Fa4 = 349.23Hz (MIDI 65)
  // Sol4 = 392.00Hz (MIDI 67)

  let midiNote = 57 + idx - 9; // La3 = 57
  if (midiNote < 57) midiNote += 12; // Do, Re, Mi, Fa, Sol oktav 4'tedir!

  if (isB2) midiNote = 58; // Si-b2

  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

// Hz Frekanstan Nota İsmi Bulma
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

// Yarım ses Transpoze
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

// Notaları Makam Gamına Oturtma
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

// Melodideki Parazitleri Filtreleme
export function smoothAndFilterMelodyNotes(
  notesList: BaglamaNoteItem[],
  genre: MakamGenre
): BaglamaNoteItem[] {
  if (notesList.length <= 2) return notesList;

  const snapped = snapNotesToMakam(notesList, genre);
  const smoothed: BaglamaNoteItem[] = [];

  for (let i = 0; i < snapped.length; i++) {
    const current = snapped[i];
    const prev = smoothed[smoothed.length - 1];

    if (!prev) {
      smoothed.push(current);
      continue;
    }

    if (current.noteName === prev.noteName) {
      continue;
    }

    const next = snapped[i + 1];
    if (next && next.noteName === prev.noteName && current.noteName !== prev.noteName) {
      continue;
    }

    smoothed.push(current);
  }

  return smoothed;
}

// Otantik Örnek Melodi Jeneratörü (Gönül Dağı Ritmsel Notaları)
export function generateSampleMelody(genre: MakamGenre): BaglamaNoteItem[] {
  const preset = TURKU_PRESETS.gonul_dagi;

  return preset.items.map((item, i) => {
    const fretInfo = getBaglamaFretForNote(item.note, 3);
    return {
      id: `sample_${i}_${Date.now()}`,
      timeSec: i * 0.8,
      noteName: item.note,
      octave: 3,
      freqHz: noteToFrequency(item.note, 3),
      stringName: fretInfo.stringName,
      fretNumber: fretInfo.fretNumber,
      fingerHint: fretInfo.fingerHint,
      durationBeats: item.dur,
      lyricsWord: item.word,
    };
  });
}
