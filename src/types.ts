export interface Message {
    type: 'text' | 'image' | 'audio';
    content: string;
    sender: 'me' | 'other';
    timestamp: Date;
    encrypted?: boolean;
    encryptedAESKey?: string; // For RSA hybrid encryption
}

export type EncryptionMode = 'None' | 'Caesar' | 'AES' | 'DES' | 'Playfair' | 'RSA';

export interface RSAKeyPair {
    publicKey: string;
    privateKey: string;
}
