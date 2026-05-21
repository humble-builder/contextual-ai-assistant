import express from "express";
import { handleChat } from "../controllers/chatController.js";
import { searchWeb } from "../services/webSearchService.js";

const router = express.Router();

router.post("/chat", handleChat);

router.get("/web-search", async (req, res) => {
    const { q } = req.query;
    const results = await searchWeb(q);
    res.json(results);
});

export default router;