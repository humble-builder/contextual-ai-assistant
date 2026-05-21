/**
 * Determines the appropriate Tavily search configuration based on the user's query.
 * @param {*} query Incoming user query
 * @returns config values for the Tavily search
 */
export const routeTavilyConfig = (query) => {
  const q = query.toLowerCase();

  // NEWS & CURRENT EVENTS
  if (
    q.includes("latest") ||
    q.includes("today") ||
    q.includes("news") ||
    q.includes("update") ||
    q.includes("breaking")
  ) {
    return {
      search_depth: "advanced",
      topic: "news",
      include_answer: true,
      max_results: 7,
      chunks_per_source: 3,
    };
  }

  // RESEARCH & DEEP DIVES
  if (
    q.includes("compare") ||
    q.includes("vs") ||
    q.includes("architecture") ||
    q.includes("design") ||
    q.includes("how to build") ||
    q.includes("deep dive")
  ) {
    return {
      search_depth: "advanced",
      topic: "general",
      include_answer: false,
      max_results: 10,
      chunks_per_source: 4,
    };
  }

  // QUICK LOOKUpS & DEFINITIONS
  if (
    q.length < 40 ||
    q.startsWith("what is") ||
    q.startsWith("who is") ||
    q.startsWith("define")
  ) {
    return {
      search_depth: "basic",
      topic: "general",
      include_answer: true,
      max_results: 3,
      chunks_per_source: 1,
    };
  }

  // DEFAULT (FACTUAl AND TECHNICAL QUERIES)
  return {
    search_depth: "advanced",
    topic: "general",
    include_answer: false,
    max_results: 5,
    chunks_per_source: 2,
  };
};