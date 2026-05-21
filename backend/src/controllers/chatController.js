/* ####### CONTROLLER FLOW ####### *\
Controller
   ↓
Chat Service
   ↓
RAG Service
   ↓
LLM Service 
\* ################################ */

import { getAnswer } from "../services/ragService.js";
import { addMessage } from "../utils/memory.js";

/**
 * Controls the chat between user and LLM
 * @param {*} req Request object received from source
 * @param {*} res Response object to be returned to source
 * @returns {JSON} Reply generated using conversation history and retrieved context
 */
export const handleChat = async (req, res) => {
    try {
        const { message, userId } = req.body;
        console.log("Incoming message:", message);
        /**
         * Null check for user ID and the user message
         */
        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }

        if (!message?.trim()) {
            return res.status(400).json({ error: "Valid message required" });
        }

        /**
         * Call AI services (RAG/LLM) to get answer for user's query,
         * Update the conversation history, and respond back to the user
         */
        const response = await getAnswer(message, userId);
        console.log("AI response:", response);

        addMessage(userId, "user", message);
        addMessage(userId, "assistant", response.reply);

        return res.json(response);
    }
    catch (err) {
        console.error("Chat Controller Error:", err);
        res.status(500).json({
            error: err.message,
            reply: "Something went wrong. Please try again later."
        });
    }
};
