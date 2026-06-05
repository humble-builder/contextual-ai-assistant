import mammoth from 'mammoth';
import * as pdf from 'pdf-parse';
import path from 'path';
import fs from 'fs';

const parsePdf = pdf.default || pdf; // Handle both CommonJS and ES Module exports

export const loadDocument = async (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await parsePdf(dataBuffer);
        return [{
            pageContent: pdfData.text, 
            metadata: {
                source: filePath,
                type: 'pdf'
            }
        }];
    }

    if (ext === '.docx') {
        const result = await mammoth.extractRawText({ path: filePath });
        return [{
            pageContent: result.value, 
            metadata: {
                source: filePath,
                type: 'docx'
            }
        }];
    }

    if (ext === '.txt') {
        const text = fs.readFileSync(filePath, 'utf-8');
        return [{
            pageContent: text, 
            metadata: {
                source: filePath,
                type: 'txt'
            }
        }];
    }

    throw new Error(`Unsupported file type: ${ext}`);
};  