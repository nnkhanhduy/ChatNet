// --- POLYFILL FOR CRYPTO (REQUIRED AT THE TOP) ---
const randomBytes = (length: number) => {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
};
if (!global.crypto) {
  (global as any).crypto = {};
}
if (!(global as any).crypto.getRandomValues) {
  (global as any).crypto.getRandomValues = (array: any) => {
    const bytes = randomBytes(array.length);
    for (let i = 0; i < array.length; i++) {
      array[i] = bytes[i];
    }
    return array;
  };
};

// --- REQUIRE MODULES ---
const CryptoJS = require('crypto-js');

// --- UTILS FUNCTIONS (INLINE INSTEAD OF IMPORTS) ---
// Caesar Cipher
function encryptCaesar(text: string, shift: number): string {
  return text.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const base = char.toUpperCase() === char ? 65 : 97;
      return String.fromCharCode(((code - base + shift) % 26) + base);
    }
    return char;
  }).join('');
}
function decryptCaesar(text: string, shift: number): string {
  return encryptCaesar(text, (26 - (shift % 26)) % 26);
}
function isValidCaesarKey(key: string): boolean {
  const n = parseInt(key);
  return !isNaN(n) && n >= 1 && n <= 25;
}
function parseKey(key: string): number {
  return parseInt(key);
}

// AES Cipher using CryptoJS
function encryptAES(data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, key).toString();
}
function decryptAES(ciphertext: string, key: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const res = bytes.toString(CryptoJS.enc.Utf8);
    return res || ciphertext; // Fallback to original if decrypt fails
  } catch (e) {
    return ciphertext; // Fallback on error
  }
}
function isValidAESKey(key: string): boolean {
  return key.length >= 8;
}

// DES Cipher using CryptoJS (Triple DES)
function encryptDES(data: string, key: string): string {
  return CryptoJS.TripleDES.encrypt(data, key).toString();
}
function decryptDES(ciphertext: string, key: string): string {
  try {
    const bytes = CryptoJS.TripleDES.decrypt(ciphertext, key);
    const res = bytes.toString(CryptoJS.enc.Utf8);
    return res || ciphertext;
  } catch (e) {
    return ciphertext;
  }
}
function isValidDESKey(key: string): boolean {
  return key.length >= 8;
}

// Playfair Cipher
function createPlayfairMatrix(key: string): string[][] {
  key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  const matrix: string[] = [];
  const used = new Set<string>();
  for (let char of key) {
    if (!used.has(char)) {
      used.add(char);
      matrix.push(char);
    }
  }
  for (let char of alphabet) {
    if (!used.has(char)) {
      matrix.push(char);
    }
  }
  return Array.from({ length: 5 }, (_, i) => matrix.slice(i * 5, (i + 1) * 5));
}
function findPosition(matrix: string[][], char: string): [number, number] | undefined {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (matrix[i][j] === char) return [i, j];
    }
  }
}
function encryptPlayfair(text: string, key: string): string {
  text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const pairs: [string, string][] = [];
  for (let i = 0; i < text.length; i += 2) {
    let a = text[i];
    let b = text[i + 1] || 'X';
    if (a === b) {
      pairs.push([a, 'X']);
      i--;
    } else {
      pairs.push([a, b]);
    }
  }
  const matrix = createPlayfairMatrix(key);
  return pairs.map(([a, b]) => {
    const posA = findPosition(matrix, a);
    const posB = findPosition(matrix, b);
    if (!posA || !posB) return a + b;
    const [rowA, colA] = posA;
    const [rowB, colB] = posB;
    if (rowA === rowB) {
      return matrix[rowA][(colA + 1) % 5] + matrix[rowB][(colB + 1) % 5];
    } else if (colA === colB) {
      return matrix[(rowA + 1) % 5][colA] + matrix[(rowB + 1) % 5][colB];
    } else {
      return matrix[rowA][colB] + matrix[rowB][colA];
    }
  }).join('');
}
function decryptPlayfair(text: string, key: string): string {
  text = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const pairs: [string, string][] = [];
  for (let i = 0; i < text.length; i += 2) {
    pairs.push([text[i], text[i + 1]]);
  }
  const matrix = createPlayfairMatrix(key);
  return pairs.map(([a, b]) => {
    const posA = findPosition(matrix, a);
    const posB = findPosition(matrix, b);
    if (!posA || !posB) return a + b;
    const [rowA, colA] = posA;
    const [rowB, colB] = posB;
    if (rowA === rowB) {
      return matrix[rowA][(colA + 4) % 5] + matrix[rowB][(colB + 4) % 5];
    } else if (colA === colB) {
      return matrix[(rowA + 4) % 5][colA] + matrix[(rowB + 4) % 5][colB];
    } else {
      return matrix[rowA][colB] + matrix[rowB][colA];
    }
  }).join('');
}
function isValidPlayfairKey(key: string): boolean {
  return /[a-zA-Z]/.test(key) && key.length >= 1;
}

// --- MAIN APP CODE ---
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Dimensions,
  Modal,
  Image,
  ImageBackground,
  PermissionsAndroid,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import TcpSocket from 'react-native-tcp-socket';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import Sound from 'react-native-nitro-sound';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_HEIGHT < 700;
const isNarrowScreen = SCREEN_WIDTH < 360;
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 667) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;
const responsiveFontSize = (size: number) => {
  const scaledSize = moderateScale(size, 0.3);
  return Math.max(Math.min(scaledSize, size * 1.2), size * 0.85);
};
interface Message {
  type: 'text' | 'image' | 'audio';
  content: string;
  sender: 'me' | 'other';
  timestamp: Date;
  encrypted?: boolean;
}
type EncryptionMode = 'None' | 'Caesar' | 'AES' | 'DES' | 'Playfair';
const PORT = 8888;
function App(): React.JSX.Element {
  const [myIp, setMyIp] = useState<string>('Đang lấy IP...');
  const [targetIp, setTargetIp] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isServerRunning, setIsServerRunning] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string>('my_secret_aes_key_123');
  const [encryptionMode, setEncryptionMode] = useState<EncryptionMode>('AES');
  const [isRecording, setIsRecording] = useState(false);
  const serverRef = useRef<any>(null);
  const clientRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const encryptionKeyRef = useRef(encryptionKey);
  const encryptionModeRef = useRef(encryptionMode);
  // Improved buffer handling with accumulation for large data
  const bufferRef = useRef<string>('');

  useEffect(() => {
    encryptionKeyRef.current = encryptionKey;
  }, [encryptionKey]);
  useEffect(() => {
    encryptionModeRef.current = encryptionMode;
  }, [encryptionMode]);
  const fetchIpAddress = () => {
    setMyIp('Đang lấy IP...');
    NetInfo.fetch().then(state => {
      if (state.details && 'ipAddress' in state.details) {
        const ip = (state.details as any).ipAddress;
        setMyIp(ip || 'Không tìm thấy IP');
      } else {
        setMyIp('Không tìm thấy IP');
      }
    });
  };
  useEffect(() => {
    fetchIpAddress();
  }, []);
  useEffect(() => {
    if (!isServerRunning) {
      startServer();
    }
    return () => {
      if (serverRef.current) {
        serverRef.current.close();
      }
      if (clientRef.current) {
        clientRef.current.destroy();
      }
      Sound.stopRecorder();
      Sound.stopPlayer();
    };
  }, []);
  const handleDecryption = (receivedData: string, mode: EncryptionMode, key: string): string => {
    let decrypted = receivedData;
    if (mode === 'Caesar') {
      const isKeyValid = isValidCaesarKey(key);
      decrypted = isKeyValid ? decryptCaesar(receivedData, parseKey(key)) : receivedData;
    } else if (mode === 'AES') {
      const isKeyValid = isValidAESKey(key);
      decrypted = isKeyValid ? decryptAES(receivedData, key) : receivedData;
    } else if (mode === 'DES') {
      const isKeyValid = isValidDESKey(key);
      decrypted = isKeyValid ? decryptDES(receivedData, key) : receivedData;
    } else if (mode === 'Playfair') {
      const isKeyValid = isValidPlayfairKey(key);
      decrypted = isKeyValid ? decryptPlayfair(receivedData, key) : receivedData;
    }
    console.log('Decrypted data:', decrypted.substring(0, 50) + '...'); // Debug log
    return decrypted;
  };
  const startServer = () => {
    try {
      const server = TcpSocket.createServer((socket: any) => {
        socket.on('data', (data: any) => {
          bufferRef.current += data.toString('utf8');
          // Process while there is enough data for at least one full message
          while (bufferRef.current.length >= 8) {
            const lengthStr = bufferRef.current.substring(0, 8);
            const length = parseInt(lengthStr, 16);
            if (isNaN(length) || length < 0) {
              // Invalid length, clear buffer to prevent infinite loop
              bufferRef.current = '';
              break;
            }
            if (bufferRef.current.length >= 8 + length) {
              const receivedData = bufferRef.current.substring(8, 8 + length);
              bufferRef.current = bufferRef.current.substring(8 + length);
              console.log('Received full data:', receivedData.substring(0, 50) + '...');
              const currentMode = encryptionModeRef.current;
              const currentKey = encryptionKeyRef.current;
              let displayContent = receivedData;
              const isEncryptionOn = currentMode !== 'None';
              if (isEncryptionOn) {
                displayContent = handleDecryption(receivedData, currentMode, currentKey);
              }
              let messageType: 'text' | 'image' | 'audio' = 'text';
              let content = displayContent;
              if (displayContent.startsWith('IMAGE:')) {
                messageType = 'image';
                content = displayContent.replace('IMAGE:', '');
              } else if (displayContent.startsWith('AUDIO:')) {
                messageType = 'audio';
                content = displayContent.replace('AUDIO:', '');
              } else {
                console.log('No prefix found.');
              }
              setMessages(prev => [
                ...prev,
                {
                  type: messageType,
                  content,
                  sender: 'other',
                  timestamp: new Date(),
                  encrypted: isEncryptionOn,
                },
              ]);
            } else {
              break; // Wait for more data
            }
          }
        });
        socket.on('error', (error: any) => {});
        socket.on('close', () => {});
      });
      server.listen({ port: PORT, host: '0.0.0.0' }, () => {
        setIsServerRunning(true);
      });
      server.on('error', (error: any) => {
        Alert.alert('Lỗi', 'Không thể khởi động server: ' + error.message);
      });
      serverRef.current = server;
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể khởi động server: ' + error.message);
    }
  };
  const handleEncryption = (dataToEncrypt: string, mode: EncryptionMode, key: string): string => {
    let encrypted = dataToEncrypt;
    if (mode === 'Caesar') {
      encrypted = encryptCaesar(dataToEncrypt, parseKey(key));
    } else if (mode === 'AES') {
      encrypted = encryptAES(dataToEncrypt, key);
    } else if (mode === 'DES') {
      encrypted = encryptDES(dataToEncrypt, key);
    } else if (mode === 'Playfair') {
      encrypted = encryptPlayfair(dataToEncrypt, key);
    }
    console.log('Encrypted data:', encrypted.substring(0, 50) + '...');
    return encrypted;
  };
  const sendMessage = (messageType: 'text' | 'image' | 'audio', content: string) => {
    if (!content.trim()) {
      Alert.alert('Thông báo', 'Nội dung không được để trống');
      return;
    }
    if (!targetIp.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập IP đối phương trong Settings');
      return;
    }
    const isEncryptionOn = encryptionMode !== 'None';
    if (isEncryptionOn) {
      let isKeyValid = false;
      let errorMsg = '';
      if (encryptionMode === 'Caesar') {
        isKeyValid = isValidCaesarKey(encryptionKey);
        errorMsg = 'Key Caesar phải là số từ 1-25';
      } else if (encryptionMode === 'AES') {
        isKeyValid = isValidAESKey(encryptionKey);
        errorMsg = 'Key AES phải có ít nhất 8 ký tự';
      } else if (encryptionMode === 'DES') {
        isKeyValid = isValidDESKey(encryptionKey);
        errorMsg = 'Key DES phải có ít nhất 8 ký tự';
      } else if (encryptionMode === 'Playfair') {
        isKeyValid = isValidPlayfairKey(encryptionKey);
        errorMsg = 'Key Playfair phải là chữ/số và có ít nhất 1 ký tự chữ cái';
      }
      if (!isKeyValid) {
        Alert.alert('Lỗi mã hóa', errorMsg);
        return;
      }
    }
    if ((messageType === 'image' || messageType === 'audio') && (encryptionMode === 'Caesar' || encryptionMode === 'Playfair')) {
      Alert.alert('Lỗi', 'Chế độ mã hóa Caesar hoặc Playfair không hỗ trợ gửi ảnh/voice (chỉ hỗ trợ text). Hãy chọn None, AES hoặc DES.');
      return;
    }
    let dataToSend = content;
    let prefix = '';
    if (messageType === 'image') {
      prefix = 'IMAGE:';
    } else if (messageType === 'audio') {
      prefix = 'AUDIO:';
    }
    dataToSend = prefix + content;
    console.log('Data to send (before encrypt):', dataToSend.substring(0, 50) + '...');
    const encryptedData = isEncryptionOn
      ? handleEncryption(dataToSend, encryptionMode, encryptionKey)
      : dataToSend;
    // Add length prefix (8 hex digits for length, padded with zeros)
    const lengthPrefix = ('00000000' + encryptedData.length.toString(16)).slice(-8);
    const fullData = lengthPrefix + encryptedData;
    setMessages(prev => [
      ...prev,
      {
        type: messageType,
        content,
        sender: 'me',
        timestamp: new Date(),
        encrypted: isEncryptionOn,
      },
    ]);
    try {
      let connectionTimeout: any;
      let isConnected = false;
      const client = TcpSocket.createConnection(
        {
          port: PORT,
          host: targetIp,
        },
        () => {
          isConnected = true;
          clearTimeout(connectionTimeout);
          // Write the full data, and handle large data by ensuring it's sent completely
          client.write(fullData, 'utf8', (error) => {
            if (error) {
              Alert.alert('Lỗi', 'Không thể gửi: ' + error.message);
            }
            setTimeout(() => {
              client.destroy();
            }, 100);
          });
        }
      );
      connectionTimeout = setTimeout(() => {
        if (!isConnected) {
          client.destroy();
          Alert.alert(
            'Lỗi kết nối',
            `Không thể kết nối đến ${targetIp}\n\nKiểm tra:\n• IP có đúng không?\n• Thiết bị có cùng WiFi không?\n• Ứng dụng đã mở ở thiết bị kia chưa?`
          );
        }
      }, 5000);
      client.on('error', (error: any) => {
        clearTimeout(connectionTimeout);
        let errorMessage = 'Không thể kết nối đến ' + targetIp;
        const errMsg = error?.message || '';
        if (errMsg.includes('ECONNREFUSED')) {
          errorMessage += '\n\n❌ Kết nối bị từ chối!\nỨng dụng chưa được mở ở thiết bị đích.';
        } else if (errMsg.includes('ETIMEDOUT') || errMsg.includes('timeout')) {
          errorMessage += '\n\n⏱️ Hết thời gian chờ!\nKiểm tra kết nối mạng và IP.';
        } else if (errMsg.includes('ENETUNREACH') || errMsg.includes('EHOSTUNREACH')) {
          errorMessage += '\n\n🌐 Không thể truy cập mạng!\nKiểm tra cả 2 thiết bị có cùng WiFi.';
        } else if (errMsg) {
          errorMessage += '\n\n' + errMsg;
        }
        Alert.alert('Lỗi kết nối', errorMessage);
      });
      client.on('close', () => {
        clearTimeout(connectionTimeout);
      });
      clientRef.current = client;
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể gửi: ' + error.message);
    }
  };
  const pickImage = async () => {
    try {
      const permissionsToRequest = [];
      if (Number(Platform.Version) >= 33) {
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
      } else {
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
      }
      const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);
      const hasPermission = permissionsToRequest.every(perm => granted[perm] === PermissionsAndroid.RESULTS.GRANTED);
      if (!hasPermission) {
        Alert.alert(
          'Quyền bị từ chối',
          'Không thể truy cập thư viện ảnh. Vui lòng kiểm tra cài đặt ứng dụng và cấp quyền thủ công.'
        );
        return;
      }
      launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.5,
      }, (response) => {
        if (response.didCancel) {
          // Canceled
        } else if (response.errorCode) {
          Alert.alert('Lỗi', `Mã lỗi: ${response.errorCode}`);
        } else if (response.assets && response.assets[0].base64) {
          const base64Image = response.assets[0].base64;
          sendMessage('image', base64Image);
        } else {
          Alert.alert('Lỗi', 'Không thể chọn hình ảnh');
        }
      });
    } catch (err) {
      console.warn(err);
      Alert.alert('Lỗi', 'Không thể yêu cầu quyền');
    }
  };
  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Quyền ghi âm',
            message: 'Ứng dụng cần quyền truy cập micro để ghi âm.',
            buttonNeutral: 'Hỏi sau',
            buttonNegative: 'Hủy',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handled in Info.plist
  };
  const handleVoiceRecord = async () => {
    if (isRecording) {
      // Stop recording
      try {
        const uri = await Sound.stopRecorder();
        if (uri) {
          const base64 = await RNFS.readFile(uri, 'base64');
          sendMessage('audio', base64);
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể dừng ghi âm');
      }
      setIsRecording(false);
    } else {
      // Start recording
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) {
        Alert.alert('Quyền bị từ chối', 'Không thể ghi âm mà không có quyền truy cập micro.');
        return;
      }
      try {
        await Sound.startRecorder();
        setIsRecording(true);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể bắt đầu ghi âm');
      }
    }
  };
  const playAudio = async (base64: string) => {
    try {
      const tempPath = `${RNFS.TemporaryDirectoryPath}/temp_audio.m4a`;
      await RNFS.writeFile(tempPath, base64, 'base64');
      await Sound.startPlayer(tempPath);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể phát âm thanh');
    }
  };
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0084ff" />
      <ImageBackground source={require('./assets/Logo.jpg')} style={styles.backgroundImage} imageStyle={styles.backgroundImageStyle}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>{[
            <Text key="title" style={styles.title}>💬 ChatNET</Text>,
            <TouchableOpacity key="settings" style={styles.settingsButton} onPress={() => setShowSettingsModal(true)} activeOpacity={0.7}>
              <Image source={require('./assets/setting.png')} style={styles.settingsIcon} resizeMode="contain" />
            </TouchableOpacity>
          ]}</View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
            <Modal visible={showSettingsModal} transparent={true} animationType="slide" onRequestClose={() => setShowSettingsModal(false)}>
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>{[
                    <Text key="modalTitle" style={styles.modalTitle}>⚙️ Cài đặt</Text>,
                    <TouchableOpacity key="close" onPress={() => setShowSettingsModal(false)} style={styles.closeButton}>
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  ]}</View>
                  <ScrollView style={styles.modalBody}>
                    <View style={styles.modalSection}>{[
                      <Text key="label1" style={styles.modalLabel}>📱 Địa chỉ IP của bạn</Text>,
                      <View key="ipRow" style={styles.ipDisplayRow}>{[
                        <Text key="ipText" style={styles.ipDisplayText}>{myIp}</Text>,
                        <TouchableOpacity key="reload" style={styles.reloadButton} onPress={fetchIpAddress} activeOpacity={0.7}>
                          <Text style={styles.reloadIcon}>↻</Text>
                        </TouchableOpacity>
                      ]}</View>
                    ]}</View>
                    <View style={styles.modalSection}>{[
                      <Text key="label2" style={styles.modalLabel}>🌐 IP người nhận</Text>,
                      <TextInput key="input" style={styles.modalInput} value={targetIp} onChangeText={setTargetIp} placeholder="Nhập IP (ví dụ: 192.168.1.100)" placeholderTextColor="#aaa" keyboardType="numeric" />
                    ]}</View>
                    <View style={styles.modalSection}>{[
                      <Text key="label3" style={styles.modalLabel}>🔐 Chọn chế độ mã hóa</Text>,
                      <View key="modeRow" style={styles.modeSelectionRow}>
                        {(['None', 'Caesar', 'AES', 'DES', 'Playfair'] as EncryptionMode[]).map((mode) => (
                          <TouchableOpacity
                            key={mode}
                            style={[
                              styles.modeButton,
                              encryptionMode === mode ? styles.modeButtonSelected : null
                            ]}
                            onPress={() => {
                              setEncryptionMode(mode);
                              if (mode === 'Caesar') {
                                setEncryptionKey('3');
                              } else if (mode === 'AES') {
                                setEncryptionKey('my_secret_aes_key_123');
                              } else if (mode === 'DES') {
                                setEncryptionKey('des_key_123');
                              } else if (mode === 'Playfair') {
                                setEncryptionKey('SECRET');
                              } else {
                                setEncryptionKey('');
                              }
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.modeButtonText,
                              encryptionMode === mode ? styles.modeButtonTextSelected : null
                            ]}>
                              {mode === 'None' ? 'Tắt' : mode}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>,
                      <Text key="subLabel" style={styles.toggleSubLabel}>
                        {encryptionMode === 'None' ? 'Mã hóa: Đang tắt' :
                         encryptionMode === 'Caesar' ? 'Mã hóa: Caesar (Cơ bản - dùng key 1-25)' :
                         encryptionMode === 'AES' ? 'Mã hóa: AES-256 (Mạnh mẽ - dùng key chữ/số)' :
                         encryptionMode === 'DES' ? 'Mã hóa: Triple DES (Trung bình - dùng key chữ/số, tối thiểu 8 ký tự)' :
                         encryptionMode === 'Playfair' ? 'Mã hóa: Playfair (Cổ điển - dùng key là từ/cụm từ)' : ''}
                      </Text>
                    ]}</View>
                    {encryptionMode !== 'None' && (
                      <View style={styles.modalSection}>{[
                        <Text key="label4" style={styles.modalLabel}>
                          🔑 Key {encryptionMode} (
                            {encryptionMode === 'Caesar' ? '1-25' :
                             encryptionMode === 'Playfair' ? 'Là từ/cụm từ' : 'Nhập khoá'}
                          )
                        </Text>,
                        <TextInput key="keyInput" style={styles.modalInput} value={encryptionKey} onChangeText={setEncryptionKey} placeholder={encryptionMode === 'Caesar' ? '3' : encryptionMode === 'Playfair' ? 'Ví dụ: SECRET' : 'Nhập khóa bí mật'} placeholderTextColor="#aaa" keyboardType={encryptionMode === 'Caesar' ? 'number-pad' : 'default'} maxLength={encryptionMode === 'Caesar' ? 2 : 50} />,
                        <View key="info" style={styles.infoBox}>{[
                          <Text key="infoIcon" style={styles.infoIcon}>ℹ️</Text>,
                          <Text key="infoText" style={styles.infoText}>
                            Cả 2 người phải dùng cùng key và cùng chế độ mã hóa để chat được với nhau.
                          </Text>
                        ]}</View>
                      ]}</View>
                    )}
                  </ScrollView>
                  <TouchableOpacity style={styles.saveButton} onPress={() => setShowSettingsModal(false)} activeOpacity={0.7}>
                    <Text style={styles.saveButtonText}>✓ Lưu cài đặt</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <View style={styles.chatArea}>
              <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent} onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
                {messages.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Vui lòng cài đặt trước khi trò chuyện</Text>
                  </View>
                ) : (
                  messages.map((msg, index) => (
                    <View key={index} style={[styles.messageRow, msg.sender === 'me' ? styles.myMessageRow : styles.otherMessageRow]}>
                      <View style={[styles.messageBubble, msg.sender === 'me' ? styles.myMessage : styles.otherMessage]}>{[
                        msg.type === 'text' ? (
                          <Text key="text" style={[styles.messageText, msg.sender === 'me' ? styles.myMessageText : styles.otherMessageText]}>
                            {msg.content}
                          </Text>
                        ) : msg.type === 'image' ? (
                          <Image key="image" source={{ uri: `data:image/jpeg;base64,${msg.content}` }} style={styles.messageImage} resizeMode="contain" />
                        ) : (
                          <TouchableOpacity key="audio" onPress={() => playAudio(msg.content)}>
                            <Text style={[styles.messageText, msg.sender === 'me' ? styles.myMessageText : styles.otherMessageText]}>
                              🎤 Phát voice
                            </Text>
                          </TouchableOpacity>
                        ),
                        <Text key="timestamp" style={[styles.timestamp, msg.sender === 'me' ? styles.myTimestamp : styles.otherTimestamp]}>
                          {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      ]}</View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
            <View style={styles.inputContainer}>{[
              <TouchableOpacity key="voice" style={styles.imagePickerButton} onPress={handleVoiceRecord} activeOpacity={0.7}>
                <Text style={styles.imagePickerIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
              </TouchableOpacity>,
              <TouchableOpacity key="picker" style={styles.imagePickerButton} onPress={pickImage} activeOpacity={0.7}>
                <Text style={styles.imagePickerIcon}>📷</Text>
              </TouchableOpacity>,
              <TextInput key="input" style={styles.messageInput} value={message} onChangeText={setMessage} placeholder="Nhập tin nhắn..." placeholderTextColor="#999" multiline maxLength={500} />,
              <TouchableOpacity key="send" style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} onPress={() => { if (message.trim()) { sendMessage('text', message.trim()); setMessage(''); } }} activeOpacity={0.7} disabled={!message.trim()}>
                <Image source={require('./assets/send-message.png')} style={styles.sendIcon} resizeMode="contain" />
              </TouchableOpacity>
            ]}</View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}
const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    opacity: 0.50,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    backgroundColor: '#0084ff',
    paddingHorizontal: scale(15),
    paddingTop: Platform.OS === 'ios' ? verticalScale(20) : verticalScale(45),
    paddingBottom: verticalScale(16),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  settingsButton: {
    padding: scale(8),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingsIcon: {
    width: moderateScale(26),
    height: moderateScale(26),
    tintColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: responsiveFontSize(20),
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: scale(5),
  },
  closeButtonText: {
    fontSize: responsiveFontSize(24),
    color: '#666',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: moderateScale(20),
  },
  modalSection: {
    marginBottom: verticalScale(20),
  },
  modalLabel: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#333',
    marginBottom: verticalScale(8),
  },
  ipDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ipDisplayText: {
    flex: 1,
    fontSize: responsiveFontSize(15),
    fontWeight: '600',
    color: '#0084ff',
  },
  reloadButton: {
    backgroundColor: '#0084ff',
    borderRadius: moderateScale(17),
    width: moderateScale(34),
    height: moderateScale(34),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(10),
  },
  reloadIcon: {
    fontSize: responsiveFontSize(20),
    color: '#fff',
    fontWeight: 'bold',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    borderRadius: moderateScale(10),
    padding: moderateScale(14),
    fontSize: responsiveFontSize(15),
    color: '#333',
    backgroundColor: '#fafafa',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(8),
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
  },
  infoIcon: {
    fontSize: responsiveFontSize(18),
    marginRight: scale(8),
  },
  infoText: {
    flex: 1,
    fontSize: responsiveFontSize(12),
    color: '#1565C0',
    lineHeight: responsiveFontSize(18),
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: moderateScale(16),
    margin: moderateScale(20),
    marginTop: 0,
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: responsiveFontSize(16),
    fontWeight: 'bold',
  },
  modeSelectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
    backgroundColor: '#f0f0f0',
    borderRadius: moderateScale(10),
    padding: scale(3),
  },
  modeButton: {
    flex: 1,
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(5),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    marginHorizontal: scale(2),
  },
  modeButtonSelected: {
    backgroundColor: '#0084ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  modeButtonText: {
    fontSize: responsiveFontSize(14),
    fontWeight: '600',
    color: '#666',
  },
  modeButtonTextSelected: {
    color: '#fff',
  },
  toggleSubLabel: {
    fontSize: responsiveFontSize(12),
    color: '#666',
    marginTop: verticalScale(2),
  },
  chatArea: {
    flex: 1,
    backgroundColor: 'rgba(240, 242, 245, 0.85)',
    marginBottom: 0,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: moderateScale(14),
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(50),
    paddingHorizontal: scale(20),
  },
  emptyText: {
    fontSize: responsiveFontSize(15),
    color: '#888',
    textAlign: 'center',
    lineHeight: responsiveFontSize(20),
  },
  messageRow: {
    marginVertical: verticalScale(4),
  },
  myMessageRow: {
    alignItems: 'flex-end',
  },
  otherMessageRow: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: SCREEN_WIDTH * 0.75,
    padding: moderateScale(12),
    borderRadius: moderateScale(16),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  myMessage: {
    backgroundColor: '#0084ff',
    borderBottomRightRadius: moderateScale(4),
  },
  otherMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: moderateScale(4),
  },
  messageText: {
    fontSize: responsiveFontSize(15),
    marginBottom: verticalScale(3),
    lineHeight: responsiveFontSize(20),
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#000',
  },
  timestamp: {
    fontSize: responsiveFontSize(11),
    alignSelf: 'flex-end',
    marginTop: verticalScale(2),
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherTimestamp: {
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: moderateScale(14),
    paddingBottom: verticalScale(24),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 0,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#d0d0d0',
    borderRadius: moderateScale(25),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),
    fontSize: responsiveFontSize(15),
    maxHeight: verticalScale(100),
    color: '#333',
    marginRight: scale(10),
    backgroundColor: '#fafafa',
  },
  sendButton: {
    backgroundColor: 'transparent',
    width: moderateScale(25),
    height: moderateScale(25),
    borderRadius: moderateScale(13),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    width: moderateScale(25),
    height: moderateScale(25),
  },
  messageImage: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_HEIGHT * 0.3,
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(5),
  },
  imagePickerButton: {
    backgroundColor: 'transparent',
    width: moderateScale(30),
    height: moderateScale(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(10),
  },
  imagePickerIcon: {
    fontSize: moderateScale(24),
    color: '#0084ff',
  },
});
export default App;