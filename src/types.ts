export interface Message {
    type: 'text' | 'image' | 'audio';
    content: string;
    sender: 'me' | 'other';
    timestamp: Date;
    encrypted?: boolean;
}

export type EncryptionMode = 'None' | 'Caesar' | 'AES' | 'DES' | 'Playfair';
