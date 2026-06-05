export const startCursor = (message) => {
    const cursorFrames = ["|", "/", "-", "\\"];
    let frameIndex = 0;
    const cursorInterval = setInterval(() => {
        process.stdout.write(`\r${message} ${cursorFrames[frameIndex]}`);
        frameIndex = (frameIndex + 1) % cursorFrames.length;
    }, 150);
    return cursorInterval;
}

export const stopCursor = (cursorInterval, message) => {
    clearInterval(cursorInterval);
    process.stdout.write(`\r${message}\n`);
}