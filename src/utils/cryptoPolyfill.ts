// --- POLYFILL FOR CRYPTO (REQUIRED AT THE TOP) ---
const randomBytes = (length: number) => {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
};

if (!(globalThis as any).crypto) {
    (globalThis as any).crypto = {};
}
if (!(globalThis as any).crypto.getRandomValues) {
    (globalThis as any).crypto.getRandomValues = (array: any) => {
        const bytes = randomBytes(array.length);
        for (let i = 0; i < array.length; i++) {
            array[i] = bytes[i];
        }
        return array;
    };
}
