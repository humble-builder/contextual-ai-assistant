const conversations = {}; // would be DB reference in future

export const getConversation = (userId) => {
    if (!conversations[userId]) {
        conversations[userId] = [];
    }
    return conversations[userId];
};

export const addMessage = (userId, role, content) => {
    const conversation = getConversation(userId);

    conversation.push({ 
        role,
        content,
        timestamp: Date.now()
    });

    if (conversation.length > 20) {
        conversation.splice(0, 2);
    }
}

export const clearConversation = (userId) => {
    delete conversations[userId];
}
