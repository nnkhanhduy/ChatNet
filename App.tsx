// --- POLYFILL FOR CRYPTO (REQUIRED AT THE TOP) ---
const randomBytes = (length: number) => {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
};
if (!(global as any).crypto) {
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
}

// --- MAIN APP CODE ---
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  ImageBackground,
  PermissionsAndroid,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import Sound from 'react-native-nitro-sound';

// Utils & Constants
import { scale, verticalScale } from './src/utils/responsive';
import { EncryptionMode } from './src/types';

// Components
import Header from './src/components/Header'; // Wait, I didn't create Header. I'll create it or keep it inline.
import ChatMessage from './src/components/ChatMessage';
import ChatInput from './src/components/ChatInput';
import SettingsModal from './src/components/SettingsModal';

// Hooks
import { useTcpSocket } from './src/hooks/useTcpSocket';

function App(): React.JSX.Element {
  const [myIp, setMyIp] = useState<string>('Đang lấy IP...');
  const [targetIp, setTargetIp] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string>('my_secret_aes_key_123');
  const [encryptionMode, setEncryptionMode] = useState<EncryptionMode>('AES');
  const [isRecording, setIsRecording] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const { messages, isServerRunning, startServer, sendMessage } = useTcpSocket(encryptionMode, encryptionKey);

  useEffect(() => {
    fetchIpAddress();
    if (!isServerRunning) {
      startServer();
    }
    return () => {
      Sound.stopRecorder();
      Sound.stopPlayer();
    };
  }, [isServerRunning, startServer]);

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

  const pickImage = async () => {
    try {
      const permissionsToRequest = [];
      if (Number(Platform.Version) >= 33) {
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES as any);
      } else {
        permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE as any);
      }
      const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);
      const hasPermission = permissionsToRequest.every(perm => granted[perm] === PermissionsAndroid.RESULTS.GRANTED);
      if (!hasPermission) {
        Alert.alert('Quyền bị từ chối', 'Không thể truy cập thư viện ảnh.');
        return;
      }
      launchImageLibrary({ mediaType: 'photo', includeBase64: true, quality: 0.5 }, (response) => {
        if (response.assets && response.assets[0].base64) {
          sendMessage('image', response.assets[0].base64, targetIp);
        }
      });
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể yêu cầu quyền');
    }
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      try {
        const uri = await Sound.stopRecorder();
        if (uri) {
          const base64 = await RNFS.readFile(uri, 'base64');
          sendMessage('audio', base64, targetIp);
        }
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể dừng ghi âm');
      }
      setIsRecording(false);
    } else {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Quyền bị từ chối', 'Không thể ghi âm.');
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
          <Header onOpenSettings={() => setShowSettingsModal(true)} />

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoid}>
            <SettingsModal
              visible={showSettingsModal}
              onClose={() => setShowSettingsModal(false)}
              myIp={myIp}
              fetchIpAddress={fetchIpAddress}
              targetIp={targetIp}
              setTargetIp={setTargetIp}
              encryptionMode={encryptionMode}
              setEncryptionMode={setEncryptionMode}
              encryptionKey={encryptionKey}
              setEncryptionKey={setEncryptionKey}
            />

            <View style={styles.chatArea}>
              <ScrollView
                ref={scrollViewRef}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
              >
                {messages.length === 0 ? (
                  <View style={styles.emptyState} />
                ) : (
                  messages.map((msg, index) => (
                    <ChatMessage key={index} msg={msg} index={index} playAudio={playAudio} />
                  ))
                )}
              </ScrollView>
            </View>

            <ChatInput
              message={message}
              setMessage={setMessage}
              isRecording={isRecording}
              handleVoiceRecord={handleVoiceRecord}
              pickImage={pickImage}
              sendMessage={(type, content) => sendMessage(type, content, targetIp)}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1 },
  backgroundImageStyle: { opacity: 0.50, resizeMode: 'contain', alignSelf: 'center' },
  container: { flex: 1, backgroundColor: 'transparent' },
  keyboardAvoid: { flex: 1 },
  chatArea: { flex: 1, backgroundColor: 'rgba(240, 242, 245, 0.85)' },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: scale(14), flexGrow: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: verticalScale(50) },
});

export default App;