import express from "express";
import dotenv from "dotenv";
import chatRoutes from "./routes/chatRoutes.js";
import { ingestDocuments } from "./rag/ingest.js";
import { searchSimilarDocs } from "./rag/search.js";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/chat", chatRoutes);

const startServer = async () => {
    await ingestDocuments();

    //const results = await searchSimilarDocs("when should we file a claim ?");
    //console.log(results);   

    app.listen(process.env.PORT, () => {
        console.log("Server running on port 3000");
    });
  };
  
startServer();