import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
} from 'react-native';
import { Message } from '../types';
import {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    moderateScale,
    verticalScale,
    responsiveFontSize
} from '../utils/responsive';

interface ChatMessageProps {
    msg: Message;
    index: number;
    playAudio: (base64: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ msg, playAudio }) => {
    return (
        <View style={[styles.messageRow, msg.sender === 'me' ? styles.myMessageRow : styles.otherMessageRow]}>
            <View style={[styles.messageBubble, msg.sender === 'me' ? styles.myMessage : styles.otherMessage]}>
                {msg.type === 'text' ? (
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
                )}
                <Text key="timestamp" style={[styles.timestamp, msg.sender === 'me' ? styles.myTimestamp : styles.otherTimestamp]}>
                    {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
    messageImage: {
        width: SCREEN_WIDTH * 0.6,
        height: SCREEN_HEIGHT * 0.3,
        borderRadius: moderateScale(10),
        marginBottom: verticalScale(5),
    },
});

export default ChatMessage;
