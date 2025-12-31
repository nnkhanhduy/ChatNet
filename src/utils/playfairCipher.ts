// src/utils/playfairCipher.ts

// Loại bỏ các ký tự không phải chữ cái và chuẩn hóa
const cleanKey = (key: string): string => {
  return key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
};

// Loại bỏ các ký tự không phải chữ cái, chuẩn hóa và thêm chữ 'X'
const cleanText = (text: string): string => {
  return text.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
};

// 1. Tạo ma trận khóa 5x5
const generateKeySquare = (key: string): string[][] => {
  const ALPHABET = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'; // Bỏ J
  const cleanedKey = cleanKey(key);
  const keySet = new Set(cleanedKey.split(''));

  const keySquare: string[] = [];

  // Thêm các ký tự trong khóa
  Array.from(keySet).forEach(char => {
    if (keySquare.length < 25) keySquare.push(char);
  });

  // Thêm các ký tự còn lại của bảng chữ cái
  for (const char of ALPHABET) {
    if (!keySet.has(char) && keySquare.length < 25) {
      keySquare.push(char);
    }
  }

  // Chuyển thành ma trận 5x5
  const matrix: string[][] = [];
  for (let i = 0; i < 5; i++) {
    matrix.push(keySquare.slice(i * 5, (i + 1) * 5));
  }
  return matrix;
};

// 2. Chuẩn bị bản rõ (Chia thành digram và thêm 'X' nếu cần)
const prepareText = (text: string): string[] => {
  let cleaned = cleanText(text);
  let prepared: string[] = [];

  for (let i = 0; i < cleaned.length; i += 2) {
    let char1 = cleaned[i];
    let char2 = cleaned[i + 1];

    if (char2 === undefined) {
      // Ký tự lẻ, thêm 'X'
      prepared.push(char1 + 'X');
      break;
    }

    if (char1 === char2) {
      // Hai ký tự trùng lặp, thêm 'X' vào giữa và lùi i lại
      prepared.push(char1 + 'X');
      i--;
    } else {
      // Hai ký tự khác nhau
      prepared.push(char1 + char2);
    }
  }
  return prepared;
};

// Tìm vị trí (hàng, cột) của một ký tự trong ma trận
const findPosition = (matrix: string[][], char: string): [number, number] | null => {
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (matrix[r][c] === char) {
        return [r, c];
      }
    }
  }
  return null;
};

// 3. Mã hóa một digram
const processDigram = (digram: string, matrix: string[][], direction: 1 | -1): string => {
  const [char1, char2] = digram.split('');
  const pos1 = findPosition(matrix, char1);
  const pos2 = findPosition(matrix, char2);

  if (!pos1 || !pos2) return digram; // Xử lý lỗi

  const [r1, c1] = pos1;
  const [r2, c2] = pos2;

  let newChar1, newChar2;

  if (r1 === r2) {
    // Cùng hàng: dịch sang phải (hoặc trái)
    newChar1 = matrix[r1][(c1 + direction + 5) % 5];
    newChar2 = matrix[r2][(c2 + direction + 5) % 5];
  } else if (c1 === c2) {
    // Cùng cột: dịch xuống dưới (hoặc lên trên)
    newChar1 = matrix[(r1 + direction + 5) % 5][c1];
    newChar2 = matrix[(r2 + direction + 5) % 5][c2];
  } else {
    // Hình chữ nhật: đổi cột
    newChar1 = matrix[r1][c2];
    newChar2 = matrix[r2][c1];
  }

  return newChar1 + newChar2;
};

/**
 * Mã hóa chuỗi bằng thuật toán Playfair.
 * @param text Chuỗi cần mã hóa.
 * @param key Khóa mã hóa (từ hoặc cụm từ).
 * @returns Chuỗi đã mã hóa (chữ in hoa).
 */
export const encryptPlayfair = (text: string, key: string): string => {
  if (!isValidPlayfairKey(key) || !text) return text;

  const matrix = generateKeySquare(key);
  const digrams = prepareText(text);

  const encrypted = digrams.map(digram => processDigram(digram, matrix, 1));

  return encrypted.join('');
};

/**
 * Giải mã chuỗi bằng thuật toán Playfair.
 * @param encryptedText Chuỗi đã mã hóa (chữ in hoa).
 * @param key Khóa giải mã.
 * @returns Chuỗi đã giải mã.
 */
export const decryptPlayfair = (encryptedText: string, key: string): string => {
  if (!isValidPlayfairKey(key) || !encryptedText) return encryptedText;

  // Chuẩn bị văn bản mã hóa (chỉ loại bỏ ký tự không phải chữ cái, không thêm X)
  const cleanedCiphertext = cleanText(encryptedText);
  let digrams: string[] = [];
  for (let i = 0; i < cleanedCiphertext.length; i += 2) {
    digrams.push(cleanedCiphertext.slice(i, i + 2));
  }

  const matrix = generateKeySquare(key);

  // Giải mã bằng cách đảo ngược hướng (direction = -1)
  const decryptedDigrams = digrams.map(digram => processDigram(digram, matrix, -1));

  let decryptedText = decryptedDigrams.join('');

  // Xóa các ký tự 'X' lót cuối cùng
  decryptedText = decryptedText.replace(/X$/, '');

  return decryptedText;
};

/**
 * Kiểm tra khóa Playfair.
 * Yêu cầu tối thiểu 1 ký tự chữ cái để tạo ma trận.
 * @param key Chuỗi khóa.
 * @returns boolean
 */
export const isValidPlayfairKey = (key: string): boolean => {
  const cleaned = cleanKey(key);
  return cleaned.length > 0;
};