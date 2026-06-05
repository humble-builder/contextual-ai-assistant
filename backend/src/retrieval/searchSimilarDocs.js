import { OpenAIEmbeddings } from "@langchain/openai";
import { documentsCollection } from "../config/db.js";
import { detectIntent } from "../intent/detectIntent.js";
import { rerankDocuments } from "./rerankDocuments.js";
import { cosineSimilarity } from "./cosineSimilarity.js";
import { semanticDedup } from "./semanticDedup.js";

/**
 * Searches for documents similar to the given query
 * @param {string} query The user's query string for which we want to find similar documents
 * @returns {Promise<Array>} Array of top relevant documents with their similarity scores
 */
export const searchSimilarDocs = async (query) => {
    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const queryIntent = detectIntent(query);
    const queryEmbedding = await embeddings.embedQuery(query);
    const documents = await documentsCollection.find({}).toArray();

    const scoredDocs = documents
        .filter((doc) => doc.embedding !== undefined && doc.embedding !== null)
        .map((doc) => ({
            ...doc,
            semanticScore: cosineSimilarity(queryEmbedding, doc.embedding),
        }));

    const rerankedDocs = rerankDocuments(scoredDocs, queryIntent);
    const uniqueDocs = semanticDedup(rerankedDocs, 0.90);

    return uniqueDocs.slice(0, 5); // Return top 5 relevant documents
};

