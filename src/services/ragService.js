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

/**
 * Service to perform RAG operations (search doc, retreive history, call LLM service)
 * @param {*} message User message or query
 * @param {*} userId Unique user identifier
 * @returns LLM response back to controller
 */

export const getAnswer = async (message, userId) => {

    /**
     * Retreive the conversation history and extract recent messages
     */
    const conversation = getConversation(userId);
    const history = conversation.slice(-6);
    
    /** 
     * Get the top K documents relevant to user query
     * Fallback to generic LLM response if search fails
     */
    const topRelevantDocs = await searchSimilarDocs(message);
    if (topRelevantDocs.length === 0) {
        const fallbackReply = await getLLMResponse([
            {
                role: "system",
                content: "You are a helpful and friendly AI assistant."
            },
            ...history,
            {
                role: "user",
                content: message
            }
        ]);
        return { reply: fallbackReply, sources: [] }
    }

    /**
     * Format the context for better understanding by LLM
     * Create the content to for LLM using the history and context
     */
    const context = topRelevantDocs
    .map((doc, i) => `Document ${i+1}:\n${doc.text}`)
    .join("\n\n");

    console.log("Context:\n", context);
    const messages = [
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

    /**
     * Call LLM, gather the reply sources and de-duplicate them
     * Return both LLM reply and the sources object
     */
    const reply = await getLLMResponse(messages);
    const sources = topRelevantDocs.map((doc) => ({
        source: doc.metadata.source,
        chunk: doc.metadata.chunk,
        score: Number(doc.score.toFixed(3))
    }));
    const uniqueSources = [ 
        ...new Map(
            sources.map(item => [
                `${item.source}-${item.chunk}`,
                item
            ])
        ).values()
    ];

    return { reply, sources: uniqueSources };
}