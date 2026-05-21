/* ####### RAG SERVICE FLOW ####### *\
message
   ↓
retreive docs
   ↓
fetch history
   ↓
build prompt
   ↓
LLM
\* ################################ */

import { getConversation } from "../utils/memory.js";
import { searchSimilarDocs } from "../rag/search.js";
import { getLLMResponse } from "./llmService.js";
import { searchWeb } from "./webSearchService.js";
import { fuseSearchResults } from "../utils/fuseSearchResults.js";

/**
 * Service to perform RAG operations (search doc, retreive history, call LLM service)
 * @param {*} message User message or query
 * @param {*} userId Unique user identifier
 * @returns LLM response back to controller
 */

export const getAnswer = async (message, userId) => {

    const webSearchResults = [];
    const retreivedDocs = [];
    const fusedResults = [];
    let prompt = [];
    const sources = [];

    // Retreive conversation history for the user to provide context to the LLM
    const conversation = getConversation(userId);
    const history = conversation.slice(-6);
    
    /** 
     * Get the top K documents relevant to user query
     * Fallback to web search for better results
     * Fallback to generic LLM response if search fails
     */

    console.log("Searching docs...");
    
    retreivedDocs.push(...await searchSimilarDocs(message)); // default vector search with cosine similarity
    const topScore = retreivedDocs.length > 0 ? retreivedDocs[0].score : 0;
    console.log("Top retrieval score: ", topScore);

    const shouldUseWebSearch = topScore < 0.50; // use web search if document relevance is low
    const shouldUseHybridSearch = topScore >= 0.50 && topScore < 0.75; // Optional: use web search alongside RAG for mid-range scores

    const shouldRetrieveWeb = shouldUseWebSearch || shouldUseHybridSearch; // if we're doing hybrid or web-only search, we want to include web results in context
    const shouldRetrieveVector = !shouldUseWebSearch; // if we're doing hybrid or vector-only, we want to include vector results in context
    
    if (shouldRetrieveWeb) {
        console.log("Low document retrieval confidence. Triggering web search...");
        webSearchResults.push(...await searchWeb(message)); // call web search service
    }

    const webSearchFailed = shouldRetrieveWeb && webSearchResults.length === 0;
    const webSearchLowConfidence = !webSearchFailed && webSearchResults.every(result => result.score < 0.5);
    
    // If web and vector search fail to provide relevant results, fallback to direct LLM response without context
    if (shouldUseWebSearch && (webSearchFailed || webSearchLowConfidence)) {
        console.log("Web search yielded no results. Calling LLM...");

        prompt = buildPrompt(false, false, history, message, [], []); // build prompt without any context
        const fallbackReply = await getLLMResponse(prompt);

        return { reply: fallbackReply, sources: [] }
    }

    /**
     * Build the prompt for the LLM based on the retrieved context and conversation history
     * LLM will use this context to generate a more informed and relevant response to the user's query
     */

    if (shouldRetrieveWeb && shouldRetrieveVector) {
        console.log("Fusing vector and web search results...");
        fusedResults.push(...fuseSearchResults({
            vectorResults: retreivedDocs,
            webResults: webSearchResults,
            queryType: shouldUseWebSearch ? "news" : "general" // Optional: could determine query type for better weighting
        }));
        console.log("Top fused result score: ", fusedResults[0]?.finalScore);

        // For hybrid approach, include fused results in the prompt
        prompt = buildPrompt(true,true,history,message,[],[],fusedResults);

    }
    
    // If only vector results are relevant, include retreived documents in the prompt
    if (!shouldRetrieveWeb && shouldRetrieveVector) {
        prompt = buildPrompt(true,false,history,message,retreivedDocs);
    }

    // If only web results are relevant, include web search results in the prompt
    if (shouldRetrieveWeb && !shouldRetrieveVector) {
        prompt = buildPrompt(false,true,history,message,[],webSearchResults);
    }

    
    console.log("Calling LLM...");
    const reply = await getLLMResponse(prompt);

    /**
     * Compile sources for traceability - where did the LLM's answer come from?
     * This is important for user trust and also for debugging/improving the system over time
     * De-duplicate sources based on type and URL/source to avoid overwhelming the user
     */

    if (shouldRetrieveVector) {   // Add vector search sources
        sources.push(...retreivedDocs.map((doc) => ({
            ...doc.metadata,
            score: Number(doc.score.toFixed(3))
        })));
    }

    if (shouldRetrieveWeb) {    // Add web search sources
        sources.push(...webSearchResults.map((result) => result.metadata));
    }

    const uniqueSources = new Map();
    sources.forEach((item) => {
        const key = `${item.type}-${item.source ?? item.url}`;
        if (!uniqueSources.has(key)) {
            uniqueSources.set(key, item);
        }
    });

    return { reply, sources: [...uniqueSources.values()] };
}

/**
 * Builds the prompt for the LLM based on the available context and conversation history
 * @param {*} useVector is vector search context relevant enough to include in prompt
 * @param {*} useWeb is web search context relevant enough to include in prompt
 * @param {*} history conversation history to include in prompt
 * @param {*} vectorResults vector search results to include in prompt
 * @param {*} webResults web search results to include in prompt
 * @param {*} fusedResults fused search results to include in prompt
 */
const buildContext = (useVector, useWeb, vectorResults, webResults, fusedResults) => {
    let context = "";

    if (useVector && !useWeb) {
        context = vectorResults  // format vector documents for LLM prompt
            .map((doc, i) => `Document ${i+1}:\n${doc.content}`)
            .join("\n\n");
    }

    if (useWeb && !useVector) {
        context = webResults // format web search results for LLM prompt
            .map((result, i) => `Web ${i+1}:\n${result.content}`)
            .join("\n\n");
    }

    if (useVector && useWeb) {
        context = fusedResults
        .map((item, i) => {
            const sourceType =
                item.retrievalType === "vector"
                    ? "Document"
                    : "Web";

            return `${sourceType} ${i+1}:\n${item.content}`;
        })
        .join("\n\n");
    }

    return context;
}

const buildPrompt = (useVector, useWeb, history, message, vectorResults, webResults, fusedResults) => {
    if (!useVector && !useWeb) {
        return [ // simple prompt with just user message and history
            {
                role: "system",
                content: "You are a helpful and friendly AI assistant."
            },
            ...history,
            {
                role: "user",
                content: message
            }
        ];
    }
    const context = buildContext(useVector, useWeb, vectorResults, webResults, fusedResults);
    const prompt = [
        {
            role: "system",
            content: `
                You are a helpful insurance assistant.

                Use the provided context whenever relevant.

                If the context contains the answer, prioritize it.
                Otherwise, respond conversationally and naturally.

                Context:
                    ${context}
            `
        },
        ...history,
        {
            role: "user",
            content: message
        }
    ]
    return prompt;
}
