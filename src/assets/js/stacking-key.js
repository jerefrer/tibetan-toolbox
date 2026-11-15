// Mac page: write what is printed on the reader's own stacking key into the drawing, where the
// browser will say it. Chrome and Edge expose the layout (navigator.keyboard.getLayoutMap); Safari
// and Firefox do not, and keep the drawing's blank key, which is still the right key.
// The stacking key is "Equal" in the browser's naming, and "Minus" is its neighbour on the left.
(function () {
  const keyboard = navigator.keyboard;
  if (!keyboard || !keyboard.getLayoutMap) return;
  // Only a printable character is trusted: with the Tibetan layout already switched on the map
  // answers in Tibetan, which is no label anybody can see on the key.
  const readable = (label) => !!label && /^[\x21-\x7e´`¨^°ß]$/.test(label);
  keyboard
    .getLayoutMap()
    .then((layout) => {
      const stacking = layout.get("Equal");
      const minus = layout.get("Minus");
      if (!readable(stacking)) return;
      for (const el of document.querySelectorAll("[data-stacking-key]")) el.textContent = stacking;
      if (readable(minus)) for (const el of document.querySelectorAll("[data-minus-key]")) el.textContent = minus;
    })
    .catch(() => {});
})();
