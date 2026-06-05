/**
 * Generates batches of a specified size from an array
 * @param {Array} array - The array to batch
 * @param {number} batchSize - The size of each batch
 * @returns {Array<Array>} An array of batches
 */

export const generateBatches = (array, batchSize) => {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
        batches.push(array.slice(i, i + batchSize));
    }
    return batches;
};