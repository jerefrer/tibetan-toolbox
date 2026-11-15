export default {
  eleventyComputed: {
    // Optional chaining: Eleventy first runs this once with a dependency-tracking proxy.
    jsonld: (data) => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: data.site?.name,
      url: `${data.site?.origin}${data.site?.basePath}`,
      description: data.site?.description,
      author: { "@type": "Person", name: data.site?.maintainer?.name, url: data.site?.maintainer?.url },
      potentialAction: {
        "@type": "SearchAction",
        target: `${data.site?.origin}${data.site?.basePath}all/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    }),
  },
};
