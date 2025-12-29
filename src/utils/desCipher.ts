// src/utils/desCipher.ts

import CryptoJS from 'crypto-js';

// Độ dài tối thiểu cho khóa DES (nên >= 8 ký tự, vì khóa DES là 64 bit, 8 byte)
const DES_MIN_KEY_LENGTH = 8;

/**
 * Mã hóa chuỗi bằng thuật toán Triple DES (DESede).
 * @param text Chuỗi cần mã hóa.
 * @param key Khóa mã hóa.
 * @returns Chuỗi đã mã hóa (base64).
 */
export const encryptDES = (text: string, key: string): string => {
  if (!text || !key) return text;

  try {
    // CryptoJS sẽ tự chuẩn hóa khóa để phù hợp với DES/Triple DES.
    const encrypted = CryptoJS.TripleDES.encrypt(text, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Trả về chuỗi Base64
    return encrypted.toString();
  } catch (error) {
    console.error('Lỗi mã hóa DES:', error);
    return text; // Trả về chuỗi gốc nếu có lỗi
  }
};

/**
 * Giải mã chuỗi bằng thuật toán Triple DES.
 * @param encryptedText Chuỗi đã mã hóa (base64).
 * @param key Khóa giải mã.
 * @returns Chuỗi đã giải mã.
 */
export const decryptDES = (encryptedText: string, key: string): string => {
  if (!encryptedText || !key) return encryptedText;

  try {
    // Tương tự, sử dụng TripleDES.decrypt
    const decrypted = CryptoJS.TripleDES.decrypt(encryptedText, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    // Nếu giải mã thất bại (sai key, sai định dạng), decryptedText sẽ là chuỗi rỗng
    if (!decryptedText) {
        return encryptedText; // Trả về chuỗi gốc nếu giải mã thất bại (để App.tsx nhận biết)
    }

    return decryptedText;
  } catch (error) {
    console.warn('Lỗi giải mã DES, có thể do khóa sai hoặc dữ liệu không hợp lệ:', error);
    return encryptedText; // Trả về chuỗi gốc nếu lỗi runtime
  }
};

/**
 * Kiểm tra khóa DES.
 * Ta dùng yêu cầu tối thiểu 8 ký tự để đảm bảo tính hợp lý khi nhập liệu.
 * @param key Chuỗi khóa.
 * @returns boolean
 */
export const isValidDESKey = (key: string): boolean => {
  return key.trim().length >= DES_MIN_KEY_LENGTH;
};