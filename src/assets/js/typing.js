/* Typing guide: send old #mac and #windows links to their own pages, and mark the visitor's device. */
(function () {
  const cards = document.querySelectorAll(".device-cards a[data-os]");
  const byOs = {};
  cards.forEach((card) => { byOs[card.dataset.os] = card; });

  // Links shared before the platform pages existed point to a section of this page.
  const fromHash = byOs[location.hash.slice(1)];
  if (fromHash && !fromHash.getAttribute("href").includes("#")) {
    location.replace(fromHash.href);
    return;
  }

  const ua = navigator.userAgent;
  let os = null;
  if (/Android/i.test(ua)) os = "android";
  else if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) os = "ios";
  else if (/Macintosh/.test(ua)) os = "mac";
  else if (/Windows/.test(ua)) os = "windows";
  const card = os && byOs[os];
  if (!card) return;
  card.classList.add("is-yours");
  card.querySelector(".device-cards__yours").hidden = false;
})();
