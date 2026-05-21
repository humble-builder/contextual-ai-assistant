import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { getAllFiles } from "../utils/getDataFiles.js";

const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
});

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100
});


/**
 * Ingest documents from the specified directory and split them into chunks
 */
const DATA_DIR = "../data";
const filePaths = getAllFiles(DATA_DIR);
const allDocuments = [];

filePaths.forEach(async (filePath) => { // Read each document, split it into chunks
    const rawText = fs.readFileSync(filePath, "utf-8");
    const source = path.basename(filePath);
    const category = path.basename(path.dirname(filePath)); // Use the parent directory name as the category
    const documents = await splitter.createDocuments(
        [rawText],
        [{ 
            source,
            category,
            uploadedAt: Date.now()
        }]
    );
    allDocuments.push(...documents);
});

export const vectorStore = [];  // In-memory vector store to hold document chunks and their embeddings

/**
 * Extract the text content from each document chunk for embedding
 * Generate embeddings for each document chunk and store them in the vector store with metadata
 */

export const ingestDocuments = async () => {
    const chunks = allDocuments.map((doc) => doc.pageContent);
    const embeddingsArray = await embeddings.embedDocuments(chunks);
    const chunkTracker = new Map();

    allDocuments.forEach((document, i) => {
        const source = document.metadata.source;
        const chunkCount = chunkTracker.get(source) || 0;
        chunkTracker.set(source, chunkCount + 1);

        vectorStore.push({
            id: uuidv4(),
            content: document.pageContent,
            metadata: {
                type: "document",
                ...document.metadata,
                chunk: chunkTracker.get(source) // Track the chunk number for each source document
            },
            embedding: embeddingsArray[i]
        });

    });

    console.log("#______Documents ingested______#");
};