import { intentKeywords } from "../../constants/intentDictionary.js"

export const scoreIntent = (userInput) => {
    const input = userInput.toLowerCase();
    const scores = {};

    for (const intent in intentKeywords) {
        scores[intent] = 0;
        for (const keyword in intentKeywords[intent]) {
            if (input.includes(keyword)) {
                scores[intent] += intentKeywords[intent][keyword];
            }
        }
    }
    
    return scores;
}

