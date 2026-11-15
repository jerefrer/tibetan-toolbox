/* Shared text matching: every word typed must appear somewhere in the tool's text. */
window.TT = {
  normalize(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  },
  matches(haystack, query) {
    const words = window.TT.normalize(query).split(/\s+/).filter(Boolean);
    const text = window.TT.normalize(haystack);
    return words.every((word) => text.includes(word));
  },
};
