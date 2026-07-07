export function enhanceTextWithSSML(text: string): string {
  if (!text) return "";
  let clean = text.trim();
  clean = clean.replace(/\s+/g, " ");
  clean = clean.replace(/([.,!?:;])([a-zA-Z0-9çğıöşüÇĞİÖŞÜ])/g, "$1 $2");
  return clean;
}
