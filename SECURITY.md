# Tài liệu Bảo mật - ChatNet

## Tổng quan

ChatNet là ứng dụng chat P2P (peer-to-peer) với nhiều lớp bảo mật, bao gồm mã hóa đối xứng, mã hóa bất đối xứng, và chữ ký số.

---

## 1. Mã hóa Caesar Cipher

### Mô tả
Caesar Cipher là thuật toán mã hóa cổ điển, dịch chuyển mỗi ký tự trong bảng chữ cái theo một số vị trí cố định.

### Cách hoạt động
- **Mã hóa**: Mỗi ký tự được dịch chuyển `n` vị trí trong bảng chữ cái
- **Giải mã**: Dịch chuyển ngược lại `n` vị trí
- **Key**: Số nguyên từ 1-25

### Ví dụ
```
Plaintext:  HELLO
Key:        3
Ciphertext: KHOOR
```

### Implementation
- File: `src/utils/caesarCipher.ts`
- Hỗ trợ: Chữ cái (A-Z, a-z), giữ nguyên số và ký tự đặc biệt

---

## 2. Mã hóa Playfair Cipher

### Mô tả
Playfair là thuật toán mã hóa digraph (mã hóa cặp ký tự), sử dụng ma trận 5×5 được tạo từ một từ khóa.

### Cách hoạt động
1. **Tạo ma trận 5×5** từ key (loại bỏ ký tự trùng lặp)
2. **Chia plaintext thành cặp** ký tự (digraphs)
3. **Mã hóa mỗi cặp** theo quy tắc:
   - Cùng hàng: Dịch sang phải
   - Cùng cột: Dịch xuống dưới
   - Khác hàng/cột: Tạo hình chữ nhật

### Ví dụ
```
Key:        MONARCHY
Matrix:     M O N A R
            C H Y B D
            E F G I K
            L P Q S T
            U V W X Z

Plaintext:  HELLO
Pairs:      HE LL OX (thêm X nếu cặp giống nhau)
Ciphertext: DMYQY
```

### Implementation
- File: `src/utils/playfairCipher.ts`
- Key: Từ hoặc cụm từ bất kỳ

---

## 3. Mã hóa DES (Data Encryption Standard)

### Mô tả
DES là thuật toán mã hóa khối đối xứng, sử dụng khóa 56-bit. ChatNet sử dụng **Triple DES (3DES)** để tăng cường bảo mật.

### Cách hoạt động
- **Block size**: 64 bits
- **Key size**: 168 bits (Triple DES)
- **Mode**: CBC (Cipher Block Chaining)
- **Padding**: PKCS7

### Triple DES Process
```
Ciphertext = E(K3, D(K2, E(K1, Plaintext)))
```
- E: Encrypt
- D: Decrypt
- K1, K2, K3: Ba khóa con được derive từ master key

### Implementation
- File: `src/utils/desCipher.ts`
- Library: `crypto-js`
- Key: Tối thiểu 8 ký tự

---

## 4. Mã hóa AES (Advanced Encryption Standard)

### Mô tả
AES là thuật toán mã hóa đối xứng hiện đại nhất, được chính phủ Mỹ chuẩn hóa. ChatNet sử dụng **AES-256**.

### Cách hoạt động
- **Block size**: 128 bits
- **Key size**: 256 bits (AES-256)
- **Rounds**: 14 rounds
- **Mode**: CBC (mặc định trong crypto-js)

### AES-256 Process
```
1. Key Expansion: Mở rộng 256-bit key thành 15 round keys
2. Initial Round: AddRoundKey
3. Main Rounds (13 lần):
   - SubBytes (S-box substitution)
   - ShiftRows
   - MixColumns
   - AddRoundKey
4. Final Round:
   - SubBytes
   - ShiftRows
   - AddRoundKey
```

### Implementation
- File: `src/utils/aesCipher.ts`
- Library: `crypto-js`
- Key: Bất kỳ chuỗi nào (được hash tự động)

---

## 5. RSA Hybrid Encryption

### Mô tả
RSA Hybrid kết hợp **RSA (mã hóa bất đối xứng)** và **AES (mã hóa đối xứng)** để có được cả bảo mật cao và hiệu suất tốt.

### Cách hoạt động

#### Tạo khóa
```
1. Generate RSA key pair (2048-bit)
   - Public Key: Chia sẻ với người chat
   - Private Key: Giữ bí mật
```

#### Mã hóa (Sender)
```
1. Generate random AES-256 key (32 bytes)
2. Encrypt message với AES key → Encrypted Message
3. Encrypt AES key với RSA Public Key của receiver → Encrypted AES Key
4. Send: {Encrypted Message, Encrypted AES Key, Signature}
```

#### Giải mã (Receiver)
```
1. Decrypt Encrypted AES Key với RSA Private Key → AES Key
2. Decrypt Encrypted Message với AES Key → Original Message
3. Verify signature
```

### Ưu điểm
- **Bảo mật tối đa**: RSA 2048-bit + AES-256
- **Hiệu suất cao**: Chỉ RSA mã hóa key nhỏ (32 bytes)
- **Perfect Forward Secrecy**: Mỗi tin nhắn dùng AES key khác nhau
- **Không giới hạn độ dài**: AES mã hóa message dài

### Implementation
- File: `src/utils/rsaCipher.ts`
- Note: Hiện tại dùng XOR đơn giản thay RSA thật (demo version)

---

## 6. Diffie-Hellman Key Exchange

### Mô tả
Diffie-Hellman cho phép hai bên tạo ra một **shared secret** qua kênh không bảo mật mà không cần trao đổi khóa trực tiếp.

### Cách hoạt động

#### Elliptic Curve Diffie-Hellman (ECDH)
ChatNet sử dụng **secp256k1** curve (cùng curve với Bitcoin).

```
Alice:
1. Generate private key: a (random)
2. Compute public key: A = a × G (G là base point)
3. Send A to Bob

Bob:
1. Generate private key: b (random)
2. Compute public key: B = b × G
3. Send B to Alice

Shared Secret:
Alice: S = a × B = a × (b × G) = ab × G
Bob:   S = b × A = b × (a × G) = ab × G
→ Cả hai có cùng shared secret S!
```

### Trong ChatNet
```
1. User A bấm "Trao đổi khóa"
2. A gửi ECDH public key cho B
3. B nhận và reply với public key của B
4. Cả hai compute shared secret
5. Shared secret được hash (SHA-256) → AES key
6. AES key tự động được set cho cả hai
```

### Implementation
- File: `src/utils/security.ts`
- Library: `elliptic` (secp256k1 curve)
- Tích hợp với chữ ký số để chống MITM

---

## 7. ECDSA Digital Signature

### Mô tả
ECDSA (Elliptic Curve Digital Signature Algorithm) cho phép xác thực người gửi và đảm bảo tính toàn vẹn của tin nhắn.

### Cách hoạt động

#### Tạo chữ ký (Sender)
```
1. Hash message: h = SHA-256(message)
2. Generate random k
3. Compute r = (k × G).x mod n
4. Compute s = k⁻¹(h + r × privateKey) mod n
5. Signature = (r, s)
```

#### Xác thực chữ ký (Receiver)
```
1. Hash message: h = SHA-256(message)
2. Compute w = s⁻¹ mod n
3. Compute u₁ = h × w mod n
4. Compute u₂ = r × w mod n
5. Compute P = u₁ × G + u₂ × PublicKey
6. Verify: P.x mod n == r
```

### Trong ChatNet
```
Gửi tin nhắn:
1. Encrypt message → ciphertext
2. Sign ciphertext với ECDSA private key → signature
3. Send: {ciphertext, signature}

Nhận tin nhắn:
1. Verify signature với ECDSA public key
2. Nếu valid → Decrypt ciphertext
3. Nếu invalid → Hiện cảnh báo "Chữ ký không hợp lệ"
```

### Tính năng Test Mode
ChatNet có tính năng "Gửi chữ ký sai" để test:
```
- Bật test mode → Signature bị corrupt 1 ký tự
- Receiver verify → Phát hiện signature invalid
- Hiện cảnh báo bảo mật
```

### Implementation
- File: `src/utils/security.ts`
- Library: `elliptic` (secp256k1), `hash.js` (SHA-256)
- Curve: secp256k1 (Bitcoin curve)

---

## Kiến trúc bảo mật tổng thể

### Layer 1: Transport
```
TCP Socket (không mã hóa transport layer)
→ Tất cả bảo mật ở application layer
```

### Layer 2: Encryption
```
Plaintext → [Encryption Algorithm] → Ciphertext
Algorithms: Caesar, Playfair, DES, AES, RSA Hybrid
```

### Layer 3: Authentication
```
Ciphertext → [ECDSA Sign] → {Ciphertext, Signature}
Verify signature để chống giả mạo
```

### Layer 4: Key Exchange
```
[ECDH] → Shared Secret → AES Key
Tự động trao đổi key an toàn
```

### Message Flow (Full Security)
```
Sender:
1. Plaintext
2. → AES Encryption → Ciphertext
3. → ECDSA Sign → {Ciphertext, Signature}
4. → TCP Send

Receiver:
1. TCP Receive → {Ciphertext, Signature}
2. → ECDSA Verify
3. → If valid: AES Decryption → Plaintext
4. → If invalid: Alert "Chữ ký không hợp lệ"
```
