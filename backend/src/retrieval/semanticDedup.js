import { logger } from "../utils/logger.js";
import { cosineSimilarity } from "./cosineSimilarity.js";

/**
 * Removes semantically duplicate documents from a list based on cosine similarity
 * @param {Array} documents - List of documents with embeddings
 * @param {number} threshold - Similarity threshold for considering documents as duplicates
 * @returns {Array} - List of unique documents
 */
export const semanticDedup = (documents, threshold = 0.90) => {
    const uniqueDocs = [];
    logger.info(`Starting semantic deduplication for ${documents.length} documents (threshold = ${threshold})`);
    
    for (const doc of documents) {
        let isDuplicate = false;
        for (const uniqueDoc of uniqueDocs) {
            if (!doc.embedding || !uniqueDoc.embedding) {
                continue; // Skip if either document lacks an embedding
            }
            const similarity = cosineSimilarity(doc.embedding, uniqueDoc.embedding);
            if (similarity >= threshold) {
                if (process.env.DEBUG_DEDUP === "true") {
                    logger.info("Skipping duplicate",{
                        similarity: similarity.toFixed(2),
                        documentSnippet: doc.content.substring(0, 100) + '...',
                        duplicateSnippet: uniqueDoc.content.substring(0, 100) + '...'
                    });
                }
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate) {
            uniqueDocs.push(doc);
        }
    }

    logger.info(`Semantic deduplication completed. ${uniqueDocs.length} unique documents retained, ${documents.length - uniqueDocs.length} duplicates removed.`);
    return uniqueDocs;
}
