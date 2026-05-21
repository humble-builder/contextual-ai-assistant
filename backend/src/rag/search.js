import { OpenAIEmbeddings } from "@langchain/openai";
import { vectorStore } from "./ingest.js";

function cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  
    const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  
    return dotProduct / (magA * magB);
}

function retrieveTopDocs(docs) {
    const sortedDocs = docs.toSorted((a, b) => b.score - a.score);
    const topDocs = sortedDocs.slice(0,5); // return top 5 docs based on cosine similarity score
    return topDocs;
}

export const searchSimilarDocs = async (query) => {
    console.log("Calling OpenAI...");
    const embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const queryEmbedding = await embeddings.embedQuery(query);
    const scoredDocs = vectorStore.map((doc) => ({
        ...doc,
        score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    const topRetreivedDocs = retrieveTopDocs(scoredDocs);

    return topRetreivedDocs;
};

