export function summarizeReviewSnippets(snippets: string[]) {
  if (!snippets.length) {
    return "Review highlights coming soon!";
  }

  const combined = snippets
    .map((snippet) => snippet.replace(/\s+/g, " ").trim())
    .join(" ");

  if (combined.length < 180) {
    return combined;
  }

  return `${combined.slice(0, 180).trim()}…`;
}

