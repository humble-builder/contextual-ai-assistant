export const fuseSearchResults = ({
    vectorResults = [],
    webResults = [],
    queryType
}) => {

    const fusedResults = [];

    // Vector weighting
    vectorResults.forEach((doc) => {

        let finalScore = doc.score * 1.2; // base boost for vector results

        // Additional boost for highly relevant documents
        if (doc.score > 0.85) {
            finalScore += 0.1;
        }

        fusedResults.push({
            ...doc,
            finalScore,
            retrievalType: "vector"
        });
    });

    // Web weighting
    webResults.forEach((result) => {

        let finalScore = result.score; // start with original web score

        // freshness boost for news/latest queries
        if (queryType === "news") {
            finalScore += 0.15;
        }

        fusedResults.push({
            ...result,
            finalScore,
            retrievalType: "web"
        });
    });

    // Global ranking
    return fusedResults
        .toSorted((a, b) => b.finalScore - a.finalScore)
        .slice(0, 8);
};