import { sessionsCollection } from "../config/db.js";

export const updateChatHistory = async (data) => {
    const { metadata, currentMessage } = data;
    await sessionsCollection.insertOne(
        { 
            ...metadata,
            ...currentMessage
        }
    );
}

export const deleteChatHistory = async (data) => {
    const { userId, sessionId, conversationId } = data;
    const deleteResult = await sessionsCollection
        .deleteMany({ 
            userId,
            sessionId,
            conversationId
        });
    return deleteResult.deletedCount;
}