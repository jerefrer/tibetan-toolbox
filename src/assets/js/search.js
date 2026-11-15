/* Shared text matching: every word typed must appear somewhere in the tool's text. */
window.TT = {
  normalize(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  },
  // A word's stem, so that "dictionary" finds "dictionaries" and "keyboards" finds "keyboard".
  stem(word) {
    if (word.length > 4 && word.endsWith("ies")) return word.slice(0, -3);
    if (word.length > 3 && word.endsWith("y")) return word.slice(0, -1);
    if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
    return word;
  },
  matches(haystack, query) {
    const words = window.TT.normalize(query).split(/\s+/).filter(Boolean);
    const text = window.TT.normalize(haystack);
    return words.every((word) => text.includes(window.TT.stem(word)));
  },
};
