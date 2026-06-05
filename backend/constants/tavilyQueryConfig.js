export const queryConfigs = {
    "news": {
        search_depth: "advanced",
        topic: "news",
        include_answer: true,
        max_results: 7,
        chunks_per_source: 3,
    },
    "research": {
        search_depth: "advanced",
        topic: "general",
        include_answer: false,
        max_results: 10,
        chunks_per_source: 4,
    },
    "definition": {
        search_depth: "basic",
        topic: "general",
        include_answer: true,
        max_results: 3,
        chunks_per_source: 1,
    },
    "facts": {
        search_depth: "advanced",
        topic: "general",
        include_answer: false,
        max_results: 5,
        chunks_per_source: 2,
    }
}