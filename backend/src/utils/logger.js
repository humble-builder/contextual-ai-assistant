export const logger = {
    info: (message, data) => {
        console.log(`\n[INFO] ${message}`, data || '');
    },
    error: (message, data) => {
        console.error(`\n[ERROR] ${message}`, data || '');
    },
    warn: (message, data) => {
        console.warn(`\n[WARN] ${message}`, data || '');
    }
}