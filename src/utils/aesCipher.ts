// src/utils/aesCipher.ts

import CryptoJS from 'crypto-js';

// Khóa AES cần phải có 32 byte (256 bit) cho AES-256.
// Khóa được truyền vào sẽ được chuyển thành một chuỗi hex 32 ký tự.
const SECRET_KEY_LENGTH = 32;

/**
 * Chuẩn bị khóa: Băm SHA256 để đảm bảo khóa có đúng 32 byte (256 bit)
 * và luôn tạo ra cùng một giá trị băm cho cùng một đầu vào.
 * @param key Chuỗi khóa người dùng nhập
 * @returns Khóa ở dạng WordArray của CryptoJS
 */
const getSecretKey = (key: string): CryptoJS.lib.WordArray => {
  // Băm khóa người dùng bằng SHA256. Đầu ra là 256 bit (32 byte)
  return CryptoJS.SHA256(key);
};

/**
 * Mã hóa chuỗi bằng thuật toán AES-256.
 * @param text Chuỗi cần mã hóa.
 * @param key Khóa mã hóa.
 * @returns Chuỗi đã mã hóa (base64).
 */
export const encryptAES = (text: string, key: string): string => {
  if (!text || !key) return text;

  try {
    const secretKey = getSecretKey(key);
    // Sử dụng AES-256 (mặc định của CryptoJS là AES-256)
    // Mode CBC, Padding PKCS7 (mặc định)
    const encrypted = CryptoJS.AES.encrypt(text, secretKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Trả về chuỗi Base64
    return encrypted.toString();
  } catch (error) {
    console.error('Lỗi mã hóa AES:', error);
    return text; // Trả về chuỗi gốc nếu có lỗi
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
    const secretKey = getSecretKey(key);
    // Lấy đối tượng CipherParams từ chuỗi Base64
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encryptedText)
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, secretKey, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Chuyển kết quả về chuỗi UTF-8.
    // Nếu giải mã thất bại, decrypted.toString(CryptoJS.enc.Utf8) sẽ trả về chuỗi rỗng.
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    // Kiểm tra xem việc giải mã có hợp lệ không (chuỗi rỗng thường là dấu hiệu lỗi)
    if (!decryptedText) {
        // Có thể là do khóa sai hoặc dữ liệu không phải là AES hợp lệ
        return encryptedText;
    }

    return decryptedText;
  } catch (error) {
    console.warn('Lỗi giải mã AES, có thể do khóa sai hoặc dữ liệu không hợp lệ:', error);
    return encryptedText; // Trả về chuỗi mã hóa nếu giải mã thất bại
  }
};

/**
 * Kiểm tra khóa AES. Chỉ kiểm tra độ dài tối thiểu để đảm bảo tính hợp lý.
 * @param key Chuỗi khóa.
 * @returns boolean
 */
export const isValidAESKey = (key: string): boolean => {
  // Khóa AES-256 cần 32 byte. Người dùng nên nhập khóa có độ dài nhất định (ví dụ: > 8)
  return key.trim().length >= 8;
};