import React from 'react';
import {
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Image,
    Text,
} from 'react-native';
import {
    scale,
    verticalScale,
    moderateScale,
    responsiveFontSize
} from '../utils/responsive';

interface ChatInputProps {
    message: string;
    setMessage: (text: string) => void;
    isRecording: boolean;
    handleVoiceRecord: () => void;
    pickImage: () => void;
    sendMessage: (type: 'text', content: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
    message,
    setMessage,
    isRecording,
    handleVoiceRecord,
    pickImage,
    sendMessage,
}) => {
    return (
        <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.imagePickerButton} onPress={handleVoiceRecord} activeOpacity={0.7}>
                <Text style={styles.imagePickerIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage} activeOpacity={0.7}>
                <Text style={styles.imagePickerIcon}>📷</Text>
            </TouchableOpacity>
            <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Nhập tin nhắn..."
                placeholderTextColor="#999"
                multiline
                maxLength={500}
            />
            <TouchableOpacity
                style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                onPress={() => {
                    if (message.trim()) {
                        sendMessage('text', message.trim());
                        setMessage('');
                    }
                }}
                activeOpacity={0.7}
                disabled={!message.trim()}
            >
                <Image
                    source={require('../../assets/send-message.png')}
                    style={styles.sendIcon}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
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

export default ChatInput;
