import fs from "fs";
import path from "path";

/**
 * Recursively get all files from a directory
 * @param {string} dirPath - The path to the directory
 * @param {Array} arrayOfFiles - The array to store the file paths
 * @returns {Array} An array of all file paths in the directory and its subdirectories
 */
export const getAllFiles = (dirPath, arrayOfFiles = []) => {

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {

        const fullPath = path.join(dirPath, file);

        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }

    });

    return arrayOfFiles;
};