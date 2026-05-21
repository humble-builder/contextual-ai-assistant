import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getLLMResponse = async (messages) => {
    const stream = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        stream: true
    });

    let fullReply = "";
    for await (const chunk of stream) {
        const content = chunk?.choices[0]?.delta?.content;
        if (content)    fullReply+= content;
    }

    return fullReply;
};
