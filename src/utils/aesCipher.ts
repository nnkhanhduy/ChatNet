// src/utils/aesCipher.ts
import CryptoJS from 'crypto-js';

/**
 * Mã hóa chuỗi bằng thuật toán AES-256.
 * @param text Chuỗi cần mã hóa.
 * @param key Khóa mã hóa.
 * @returns Chuỗi đã mã hóa (base64).
 */
export const encryptAES = (text: string, key: string): string => {
  if (!text || !key) return text;

  try {
    // CryptoJS.AES.encrypt tự động hash key và mã hóa
    const encrypted = CryptoJS.AES.encrypt(text, key);
    return encrypted.toString();
  } catch (error) {
    console.error('Lỗi mã hóa AES:', error);
    throw error;
  }
};

/**
 * Giải mã chuỗi bằng thuật toán AES-256.
 * @param encryptedText Chuỗi đã mã hóa (base64).
 * @param key Khóa giải mã.
 * @returns Chuỗi đã giải mã.
 */
export const decryptAES = (encryptedText: string, key: string): string => {
  if (!encryptedText || !key) return encryptedText;

  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      return encryptedText;
    }

    return decryptedText;
  } catch (error) {
    console.warn('Lỗi giải mã AES:', error);
    return encryptedText;
  }
};

/**
 * Kiểm tra khóa AES. Chỉ kiểm tra độ dài tối thiểu để đảm bảo tính hợp lý.
 * @param key Chuỗi khóa.
 * @returns boolean
 */
export const isValidAESKey = (key: string): boolean => {
  return key.trim().length >= 8;
};