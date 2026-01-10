// src/utils/rsaCipher.ts
// Simplified RSA implementation for React Native
// Using a simpler approach with base64 encoding

/**
 * Tạo cặp khóa RSA đơn giản (mock implementation)
 * Note: This is a simplified version for demo purposes
 * For production, consider using react-native-rsa or similar
 */
export const generateRSAKeyPair = async (keySize: number = 2048): Promise<{
    publicKey: string;
    privateKey: string;
}> => {
    try {
        console.log('Generating RSA keys (simplified version)...');

        // Generate random keys (simplified - not cryptographically secure RSA)
        // This is a placeholder implementation
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);

        const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${btoa(timestamp + random).substring(0, 200)}
-----END PUBLIC KEY-----`;

        const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC${btoa(random + timestamp).substring(0, 200)}
-----END PRIVATE KEY-----`;

        console.log('RSA keys generated (demo keys)');

        return {
            publicKey,
            privateKey,
        };
    } catch (error) {
        console.error('Error generating RSA keys:', error);
        throw new Error('Failed to generate RSA keys: ' + error);
    }
};

/**
 * Mã hóa bằng XOR đơn giản (thay thế RSA cho demo)
 * Note: Đây KHÔNG phải RSA thật, chỉ là placeholder
 */
export const encryptRSA = async (
    text: string,
    publicKey: string
): Promise<string> => {
    try {
        console.log('Encrypting with RSA (simplified)...');

        // Simple XOR encryption with key hash
        const keyHash = publicKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const encrypted = text.split('').map(char =>
            String.fromCharCode(char.charCodeAt(0) ^ (keyHash % 256))
        ).join('');

        // Encode to base64
        return btoa(encrypted);
    } catch (error) {
        console.error('Error encrypting:', error);
        throw new Error('RSA encryption failed: ' + error);
    }
};

/**
 * Giải mã XOR đơn giản
 */
export const decryptRSA = async (
    encryptedText: string,
    privateKey: string
): Promise<string> => {
    try {
        console.log('Decrypting with RSA (simplified)...');

        // Decode from base64
        const decoded = atob(encryptedText);

        // XOR decryption (same as encryption with XOR)
        const keyHash = privateKey.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const decrypted = decoded.split('').map(char =>
            String.fromCharCode(char.charCodeAt(0) ^ (keyHash % 256))
        ).join('');

        return decrypted;
    } catch (error) {
        console.error('Error decrypting:', error);
        throw new Error('RSA decryption failed: ' + error);
    }
};

/**
 * Tạo khóa AES ngẫu nhiên cho hybrid encryption
 */
export const generateRandomAESKey = (length: number = 32): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
