import { OpenAIEmbeddings } from "@langchain/openai";
import { vectorStore } from "./ingest.js";

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  
    const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  
    return dotProduct / (magA * magB);
}

function retrieveTopDocs(docs) {
    const relevantDocs = docs.filter((doc) => doc.score > 0.75);
    const sortedDocs = relevantDocs.toSorted((a, b) => b.score - a.score);
    const topRelevantDocs = sortedDocs.slice(0,3);
    return topRelevantDocs;
}

export const searchSimilarDocs = async (query) => {
    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const queryEmbedding = await embeddings.embedQuery(query);
    const scoredDocs = vectorStore.map((doc) => ({
        ...doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    const topRelevantDocs = retrieveTopDocs(scoredDocs);

    return topRelevantDocs;
};

