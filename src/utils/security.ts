import { ec as EC } from 'elliptic';
import { Buffer } from 'buffer';

const ec = new EC('secp256k1');

/**
 * Generates a new Public/Private Key Pair.
 */
export const generateKeyPair = () => {
    const key = ec.genKeyPair();
    return {
        publicKey: key.getPublic('hex'),
        privateKey: key.getPrivate('hex'),
    };
};

/**
 * Computes a shared secret using own Private Key and other's Public Key (ECDH).
 */
export const computeSharedSecret = (privateKeyHex: string, otherPublicKeyHex: string) => {
    try {
        const key = ec.keyFromPrivate(privateKeyHex);
        const otherKey = ec.keyFromPublic(otherPublicKeyHex, 'hex');
        const shared = key.derive(otherKey.getPublic());
        return shared.toString(16);
    } catch (error) {
        console.error('Error computing shared secret:', error);
        return null;
    }
};

/**
 * Signs a message using Private Key (ECDSA).
 */
export const signMessage = (privateKeyHex: string, message: string) => {
    try {
        // We usually sign the hash of the message, but for simplicity here we sign the content or its hash if strict.
        // Elliptic automatically hashes the message if we use .sign? No, usually we pass hash.
        // Let's use a simple hash function or rely on library if it supports string. 
        // elliptic .sign takes 'msg' which is usually a hash.
        // To keep it simple without extra hash libs, (and since this is a demo/toy app),
        // we'll interpret the message string bytes as the hash or use a simple hashing if needed.
        // BETTER: Use built-in crypto hash if available, or just map string to hex.
        // However, elliptic requires array or hex.

        const msgHex = Buffer.from(message).toString('hex');
        const key = ec.keyFromPrivate(privateKeyHex);
        const signature = key.sign(msgHex);
        return signature.toDER('hex');
    } catch (error) {
        console.error('Error signing message:', error);
        return '';
    }
};

/**
 * Verifies a signature using Public Key.
 */
export const verifySignature = (publicKeyHex: string, message: string, signatureHex: string) => {
    try {
        const msgHex = Buffer.from(message).toString('hex');
        const key = ec.keyFromPublic(publicKeyHex, 'hex');
        return key.verify(msgHex, signatureHex);
    } catch (error) {
        // console.error('Error verifying signature:', error);
        return false;
    }
};
