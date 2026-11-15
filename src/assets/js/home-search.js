/* Home page: live results under the search box. Without JS the form goes to /all/?q=. */
(function () {
  const form = document.querySelector(".hero-search");
  const input = document.getElementById("q");
  const box = document.getElementById("home-results");
  if (!form || !input || !box) return;

  const MAX = 8;
  let index = null;
  let loading = null;

  function load() {
    if (!loading) {
      loading = fetch(form.dataset.index)
        .then((response) => response.json())
        .then((data) => {
          index = data.map((tool) => ({
            tool,
            text: [tool.name, tool.author, tool.description, tool.language, tool.needNames.join(" "),
              tool.free ? "free" : "", tool.openSource ? "open source" : "", tool.developer ? "developer library" : ""].join(" "),
          }));
        })
        .catch(() => { index = []; });
    }
    return loading;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function render() {
    const query = input.value.trim();
    box.textContent = "";
    if (!query || !index) { box.hidden = true; return; }
    const hits = index.filter((entry) => window.TT.matches(entry.text, query));
    box.hidden = false;
    if (!hits.length) {
      box.appendChild(el("p", "home-results__none", "No tool matches “" + query + "” yet."));
      return;
    }
    const list = el("ul", "home-results__list");
    hits.slice(0, MAX).forEach(({ tool }) => {
      const item = el("li");
      const link = el("a", "home-results__item");
      link.href = tool.url;
      link.rel = "noopener";
      link.target = "_blank";
      const icon = el("img", "home-results__icon");
      icon.src = tool.icon;
      icon.alt = "";
      icon.width = 36;
      icon.height = 36;
      link.appendChild(icon);
      const text = el("span", "home-results__text");
      text.appendChild(el("strong", "", tool.name));
      text.appendChild(el("span", "home-results__by", " by " + tool.author));
      text.appendChild(el("span", "home-results__desc", tool.description));
      link.appendChild(text);
      item.appendChild(link);
      list.appendChild(item);
    });
    box.appendChild(list);
    const more = el("p", "home-results__more");
    const all = el("a", "", hits.length > MAX ? "See all " + hits.length + " results" : "Open in the full list");
    all.href = form.dataset.all + "?q=" + encodeURIComponent(query);
    more.appendChild(all);
    box.appendChild(more);
  }

  input.addEventListener("focus", load);
  input.addEventListener("input", () => { load().then(render); });
  form.addEventListener("submit", (event) => {
    // Let the browser go to /all/?q=... : the full list does the filtering.
    if (!input.value.trim()) event.preventDefault();
  });
})();
