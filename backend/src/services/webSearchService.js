import { tavily } from '@tavily/core';
import { routeTavilyConfig } from '../utils/routeTavilyQuery.js';

const client = tavily({
    apiKey: process.env.TAVILY_API_KEY,
});

/**
 * Search the web using the Tavily API with the given query and return normalized results
 * @param {string} query - The search query to send to the Tavily Web Search API
 * @returns {Array} An array of normalized search results containing content, score, and metadata
 */

export const searchWeb = async (query) => {
    try {
        console.log("Calling Tavily Web Search API...");
        const config = routeTavilyConfig(query);
        const searchResults = await client.search(query, config);
        return normalizeWebResults(searchResults);

    } catch (error) {
        console.error("Web Search Error:", error.message);
        return [];
    }
};

/**
 * Normalize the raw search results from the Tavily API into a consistent format for downstream processing
 * @param {Object} searchResults - The raw search results returned by the Tavily API
 * @returns {Array} An array of normalized search result objects with content, score, and metadata
 */
const normalizeWebResults = (searchResults) => {
    if (!searchResults?.results?.length) return [];

    return searchResults.results.map(result => ({
        content: result.answer ?? result.content,
        score: result.score,
        metadata: {
            title: result.title,
            url: result.url,
            type: "web"
        }
    }));
}