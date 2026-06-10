import express from "express";
import { createChat, getChatHistory, deleteChat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/create", createChat);
router.delete("/:sessionId/:conversationId", deleteChat);
router.get("/history", getChatHistory);

export default router;