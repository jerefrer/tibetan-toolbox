/* All tools: search box + filters narrow the plain list. Without JS the list is shown whole. */
(function () {
  const list = document.getElementById("tool-list");
  const filters = document.querySelector("[data-filters]");
  const form = document.getElementById("filter-form");
  const search = document.getElementById("search");
  const summary = document.getElementById("summary");
  const empty = document.getElementById("empty");
  if (!list || !filters || !form || !search) return;

  filters.hidden = false;
  document.documentElement.classList.add("js");

  const cards = Array.from(list.querySelectorAll(".tool")).map((node) => ({
    node,
    text: node.textContent,
    needs: node.dataset.needs.split(" "),
    platforms: node.dataset.platforms.split(" ").filter(Boolean),
    free: node.dataset.free === "true",
    open: node.dataset.open === "true",
    dev: node.dataset.dev === "true",
  }));
  const total = cards.length;

  const labelOf = (name, value) => {
    const box = form.querySelector('input[name="' + name + '"][value="' + value + '"]');
    return box ? box.parentElement.textContent.trim() : value;
  };
  const checked = (name) => Array.from(form.querySelectorAll('input[name="' + name + '"]:checked')).map((box) => box.value);

  function apply() {
    const query = search.value.trim();
    const needs = checked("need");
    const platforms = checked("platform");
    const free = form.elements.free.checked;
    const open = form.elements.open.checked;
    const dev = form.elements.dev.checked;

    let shown = 0;
    cards.forEach((card) => {
      const ok =
        (!query || window.TT.matches(card.text, query)) &&
        (!needs.length || needs.some((n) => card.needs.includes(n))) &&
        (!platforms.length || platforms.some((p) => card.platforms.includes(p))) &&
        (!free || card.free) &&
        (!open || card.open) &&
        (!dev || card.dev);
      card.node.hidden = !ok;
      if (ok) shown += 1;
    });

    const parts = [];
    if (query) parts.push("“" + query + "”");
    needs.forEach((n) => parts.push(labelOf("need", n)));
    platforms.forEach((p) => parts.push(labelOf("platform", p)));
    if (free) parts.push("free");
    if (open) parts.push("open source");
    if (dev) parts.push("developer libraries");
    const count = shown + (shown === 1 ? " tool" : " tools");
    summary.textContent = parts.length ? count + " matching " + parts.join(", ") : total + " tools, in alphabetical order, with fonts and developer libraries last.";
    empty.hidden = shown !== 0;
  }

  const initial = new URLSearchParams(location.search).get("q");
  if (initial) search.value = initial;

  form.addEventListener("change", apply);
  search.addEventListener("input", apply);
  search.form.addEventListener("submit", (event) => { event.preventDefault(); apply(); });
  form.addEventListener("reset", () => { setTimeout(apply, 0); });
  apply();
})();
