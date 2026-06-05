import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

export let documentsCollection;

export const connectDB = async () => {
    try {
        await client.connect();
        console.log("MongoDB connected");

        const db = client.db("insurance_rag");
        documentsCollection =
            db.collection("documents");
    } catch (err) {
        console.error("MongoDB connection failed", err);
    }

};