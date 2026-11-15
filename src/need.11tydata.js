export default {
  eleventyComputed: {
    jsonld: (data) => {
      const need = data.need;
      if (!need) return undefined;
      const tools = (data.tools ?? []).filter((t) => t.needs.includes(need.id));
      return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: need.title,
        description: need.metaDescription,
        numberOfItems: tools.length,
        itemListElement: tools.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          url: t.url,
        })),
      };
    },
  },
};
