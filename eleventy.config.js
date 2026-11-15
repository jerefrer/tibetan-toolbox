import * as yaml from "js-yaml";
import { fromWylie } from "./src/assets/js/ewts.js";

export default function (eleventyConfig) {
  // Data files are YAML (Eleventy reads JSON and JS out of the box).
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));
  // Static assets are copied as-is; the url filter handles the path prefix in templates.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/downloads": "downloads" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });
  // Custom domain for GitHub Pages.
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  eleventyConfig.addFilter("toolsForNeed", (tools, needId) =>
    tools.filter((tool) => tool.needs.includes(needId)),
  );
  // A need may list its tools in a chosen order; unlisted tools keep the default order after them.
  eleventyConfig.addFilter("inNeedOrder", (tools, need) => {
    const order = need.toolOrder ?? [];
    const rank = (tool) => (order.includes(tool.id) ? order.indexOf(tool.id) : order.length);
    return [...tools].sort((a, b) => rank(a) - rank(b));
  });
  const byName = (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" });
  // Neutral order: alphabetical, whoever the author is.
  eleventyConfig.addFilter("userTools", (tools) => tools.filter((tool) => !tool.developer).sort(byName));
  eleventyConfig.addFilter("devTools", (tools) => tools.filter((tool) => tool.developer).sort(byName));
  // Teaser keeps the order of tools.yaml, which is the order shown on the home page.
  eleventyConfig.addFilter("teasers", (tools) => tools.filter((tool) => tool.developer && tool.teaser));
  eleventyConfig.addFilter("needName", (needId, needs) => needs.find((n) => n.id === needId)?.name ?? needId);
  eleventyConfig.addFilter("needNames", (needIds, needs) =>
    needIds.map((id) => needs.find((n) => n.id === id)?.name ?? id),
  );
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  // Every link to another site opens in a new tab, so the visitor never loses the toolbox.
  eleventyConfig.addTransform("externalLinksInNewTab", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/<a\b([^>]*\bhref="https?:\/\/(?!(?:www\.)?tibetantoolbox\.org)[^"]*"[^>]*)>/g, (tag, attrs) => {
      let out = attrs;
      if (!/\btarget=/.test(out)) out += ' target="_blank"';
      if (!/\brel=/.test(out)) out += ' rel="noopener"';
      return `<a${out}>`;
    });
  });
  // Each platform has its own guide page.
  eleventyConfig.addFilter("deviceHref", (device) => `/type-tibetan/${device.id}/`);
  // JSON for an inline <script type="application/ld+json"> block: "<" is escaped so that
  // no description can close the tag.
  eleventyConfig.addFilter("jsonLd", (value) => JSON.stringify(value).replace(/</g, "\\u003c"));
  eleventyConfig.addFilter("hostOf", (url) => new URL(url).hostname.replace(/^www\./, ""));

  // Course copy marks bold with ** and Wylie with backticks. Escape first, then convert.
  eleventyConfig.addFilter("inline", (text) => {
    const escaped = String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return escaped
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<kbd>$1</kbd>");
  });

  // Wylie to Tibetan, with the converter the practice page runs in the browser, so that the cheat
  // sheet drawn at build time cannot disagree with it.
  eleventyConfig.addFilter("wylie", (text) => fromWylie(String(text)));

  // Like "inline", with every run of Tibetan set in Jomolhari (the font is lowered and enlarged in CSS).
  eleventyConfig.addFilter("richText", (text) => {
    const escaped = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return escaped
      .replace(/([\u0F00-\u0FFF]+)/g, '<span class="bo" lang="bo">$1</span>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<kbd>$1</kbd>");
  });

  return {
    pathPrefix: "/",
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
