import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import TcpSocket from 'react-native-tcp-socket';
import { Message, EncryptionMode } from '../types';
import { PORT } from '../constants';
import { encryptAES, decryptAES, isValidAESKey } from '../utils/aesCipher';
import { encryptDES, decryptDES, isValidDESKey } from '../utils/desCipher';
import { encryptCaesar, decryptCaesar, isValidKey as isValidCaesarKey, parseKey as parseCaesarKey } from '../utils/caesarCipher';
import { encryptPlayfair, decryptPlayfair, isValidPlayfairKey } from '../utils/playfairCipher';

export const useTcpSocket = (encryptionMode: EncryptionMode, encryptionKey: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isServerRunning, setIsServerRunning] = useState(false);

    const serverRef = useRef<any>(null);
    const clientRef = useRef<any>(null);
    const bufferRef = useRef<string>('');

    const encryptionModeRef = useRef(encryptionMode);
    const encryptionKeyRef = useRef(encryptionKey);

    useEffect(() => {
        encryptionModeRef.current = encryptionMode;
        encryptionKeyRef.current = encryptionKey;
    }, [encryptionMode, encryptionKey]);

    const handleDecryption = useCallback((receivedData: string, mode: EncryptionMode, key: string): string => {
        let decrypted = receivedData;
        if (mode === 'Caesar') {
            decrypted = isValidCaesarKey(key) ? decryptCaesar(receivedData, parseCaesarKey(key)) : receivedData;
        } else if (mode === 'AES') {
            decrypted = isValidAESKey(key) ? decryptAES(receivedData, key) : receivedData;
        } else if (mode === 'DES') {
            decrypted = isValidDESKey(key) ? decryptDES(receivedData, key) : receivedData;
        } else if (mode === 'Playfair') {
            decrypted = isValidPlayfairKey(key) ? decryptPlayfair(receivedData, key) : receivedData;
        }
        return decrypted;
    }, []);

    const handleEncryption = useCallback((dataToEncrypt: string, mode: EncryptionMode, key: string): string => {
        let encrypted = dataToEncrypt;
        if (mode === 'Caesar') {
            encrypted = encryptCaesar(dataToEncrypt, parseCaesarKey(key));
        } else if (mode === 'AES') {
            encrypted = encryptAES(dataToEncrypt, key);
        } else if (mode === 'DES') {
            encrypted = encryptDES(dataToEncrypt, key);
        } else if (mode === 'Playfair') {
            encrypted = encryptPlayfair(dataToEncrypt, key);
        }
        return encrypted;
    }, []);

    const startServer = useCallback(() => {
        try {
            if (serverRef.current) return;

            const server = TcpSocket.createServer((socket: any) => {
                socket.on('data', (data: any) => {
                    bufferRef.current += data.toString('utf8');
                    while (bufferRef.current.length >= 8) {
                        const lengthStr = bufferRef.current.substring(0, 8);
                        const length = parseInt(lengthStr, 16);
                        if (isNaN(length) || length < 0) {
                            bufferRef.current = '';
                            break;
                        }
                        if (bufferRef.current.length >= 8 + length) {
                            const receivedData = bufferRef.current.substring(8, 8 + length);
                            bufferRef.current = bufferRef.current.substring(8 + length);

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
                            break;
                        }
                    }
                });
                socket.on('error', () => { });
                socket.on('close', () => { });
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
    }, [handleDecryption]);

    const sendMessage = useCallback((messageType: 'text' | 'image' | 'audio', content: string, targetIp: string) => {
        if (!content.trim()) return;
        if (!targetIp.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập IP đối phương trong Settings');
            return;
        }

        const isEncryptionOn = encryptionModeRef.current !== 'None';
        const currentMode = encryptionModeRef.current;
        const currentKey = encryptionKeyRef.current;

        if (isEncryptionOn) {
            let isKeyValid = false;
            let errorMsg = '';
            if (currentMode === 'Caesar') {
                isKeyValid = isValidCaesarKey(currentKey);
                errorMsg = 'Key Caesar phải là số từ 1-25';
            } else if (currentMode === 'AES') {
                isKeyValid = isValidAESKey(currentKey);
                errorMsg = 'Key AES phải có ít nhất 8 ký tự';
            } else if (currentMode === 'DES') {
                isKeyValid = isValidDESKey(currentKey);
                errorMsg = 'Key DES phải có ít nhất 8 ký tự';
            } else if (currentMode === 'Playfair') {
                isKeyValid = isValidPlayfairKey(currentKey);
                errorMsg = 'Key Playfair phải là chữ/số và có ít nhất 1 ký tự chữ cái';
            }

            if (!isKeyValid) {
                Alert.alert('Lỗi mã hóa', errorMsg);
                return;
            }
        }

        if ((messageType === 'image' || messageType === 'audio') && (currentMode === 'Caesar' || currentMode === 'Playfair')) {
            Alert.alert('Lỗi', 'Chế độ mã hóa Caesar hoặc Playfair không hỗ trợ gửi ảnh/voice (chỉ hỗ trợ text). Hãy chọn None, AES hoặc DES.');
            return;
        }

        let prefix = '';
        if (messageType === 'image') prefix = 'IMAGE:';
        else if (messageType === 'audio') prefix = 'AUDIO:';

        const dataToSend = prefix + content;
        const encryptedData = isEncryptionOn
            ? handleEncryption(dataToSend, currentMode, currentKey)
            : dataToSend;

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
            const client = TcpSocket.createConnection({ port: PORT, host: targetIp }, () => {
                isConnected = true;
                clearTimeout(connectionTimeout);
                client.write(fullData, 'utf8', (error) => {
                    if (error) Alert.alert('Lỗi', 'Không thể gửi: ' + error.message);
                    setTimeout(() => client.destroy(), 100);
                });
            });

            connectionTimeout = setTimeout(() => {
                if (!isConnected) {
                    client.destroy();
                    Alert.alert('Lỗi kết nối', `Không thể kết nối đến ${targetIp}`);
                }
            }, 5000);

            client.on('error', (error: any) => {
                clearTimeout(connectionTimeout);
                Alert.alert('Lỗi kết nối', error?.message || 'Lỗi không xác định');
            });

            clientRef.current = client;
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể gửi: ' + error.message);
        }
    }, [handleEncryption]);

    useEffect(() => {
        return () => {
            if (serverRef.current) serverRef.current.close();
            if (clientRef.current) clientRef.current.destroy();
        };
    }, []);

    return {
        messages,
        isServerRunning,
        startServer,
        sendMessage,
        setMessages,
    };
};
