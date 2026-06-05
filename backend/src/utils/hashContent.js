import crypto from "crypto";

/**
 * Generate a hash for the given content using MD5 algorithm
 * @param {string} content - The content to be hashed
 * @return {string} The generated hash value for the content
 */

export const hashContent = (content = "") => {
    return crypto
        .createHash("md5")
        .update(content.trim().toLocaleLowerCase()) // Normalize content by trimming and converting to lowercase
        .digest("hex");
}