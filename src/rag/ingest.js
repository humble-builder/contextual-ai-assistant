import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config();
const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.resolve(__dirname,"data/policy.txt");
const rawText = fs.readFileSync(filePath,"utf-8");
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100
});
const documents = await splitter.createDocuments([rawText]);
const chunks = documents.map((doc) => doc.pageContent);

export const vectorStore = [];

export const ingestDocuments = async () => {
    const embeddingsArray = await embeddings.embedDocuments(chunks);
    
    chunks.forEach((chunk, i) => {
        vectorStore.push({
            id: uuidv4(),
            text: chunk,
            metadata: {
                source: path.basename(filePath),
                chunk: i + 1,
                uploadedAt: Date.now()
            },
            embedding: embeddingsArray[i]
        });
    });

    console.log("#______Documents ingested______#");
};