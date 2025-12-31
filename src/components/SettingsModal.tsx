import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ScrollView,
    Modal,
    Image,
} from 'react-native';
import {
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    scale,
    verticalScale,
    moderateScale,
    responsiveFontSize
} from '../utils/responsive';
import { EncryptionMode } from '../types';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
    myIp: string;
    fetchIpAddress: () => void;
    targetIp: string;
    setTargetIp: (ip: string) => void;
    encryptionMode: EncryptionMode;
    setEncryptionMode: (mode: EncryptionMode) => void;
    encryptionKey: string;
    setEncryptionKey: (key: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    visible,
    onClose,
    myIp,
    fetchIpAddress,
    targetIp,
    setTargetIp,
    encryptionMode,
    setEncryptionMode,
    encryptionKey,
    setEncryptionKey,
}) => {
    const handleModeChange = (mode: EncryptionMode) => {
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
    };

    return (
        <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text key="modalTitle" style={styles.modalTitle}>⚙️ Cài đặt</Text>
                        <TouchableOpacity key="close" onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalBody}>
                        <View style={styles.modalSection}>
                            <Text key="label1" style={styles.modalLabel}>📱 Địa chỉ IP của bạn</Text>
                            <View key="ipRow" style={styles.ipDisplayRow}>
                                <Text key="ipText" style={styles.ipDisplayText}>{myIp}</Text>
                                <TouchableOpacity key="reload" style={styles.reloadButton} onPress={fetchIpAddress} activeOpacity={0.7}>
                                    <Text style={styles.reloadIcon}>↻</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.modalSection}>
                            <Text key="label2" style={styles.modalLabel}>🌐 IP người nhận</Text>
                            <TextInput
                                key="input"
                                style={styles.modalInput}
                                value={targetIp}
                                onChangeText={setTargetIp}
                                placeholder="Nhập IP (ví dụ: 192.168.1.100)"
                                placeholderTextColor="#aaa"
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.modalSection}>
                            <Text key="label3" style={styles.modalLabel}>🔐 Chọn chế độ mã hóa</Text>
                            <View key="modeRow" style={styles.modeSelectionRow}>
                                {(['None', 'Caesar', 'AES', 'DES', 'Playfair'] as EncryptionMode[]).map((mode) => (
                                    <TouchableOpacity
                                        key={mode}
                                        style={[
                                            styles.modeButton,
                                            encryptionMode === mode ? styles.modeButtonSelected : null
                                        ]}
                                        onPress={() => handleModeChange(mode)}
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
                            </View>
                            <Text key="subLabel" style={styles.toggleSubLabel}>
                                {encryptionMode === 'None' ? 'Mã hóa: Đang tắt' :
                                    encryptionMode === 'Caesar' ? 'Mã hóa: Caesar (Cơ bản - dùng key 1-25)' :
                                        encryptionMode === 'AES' ? 'Mã hóa: AES-256 (Mạnh mẽ - dùng key chữ/số)' :
                                            encryptionMode === 'DES' ? 'Mã hóa: Triple DES (Trung bình - dùng key chữ/số, tối thiểu 8 ký tự)' :
                                                encryptionMode === 'Playfair' ? 'Mã hóa: Playfair (Cổ điển - dùng key là từ/cụm từ)' : ''}
                            </Text>
                        </View>
                        {encryptionMode !== 'None' && (
                            <View style={styles.modalSection}>
                                <Text key="label4" style={styles.modalLabel}>
                                    🔑 Key {encryptionMode} (
                                    {encryptionMode === 'Caesar' ? '1-25' :
                                        encryptionMode === 'Playfair' ? 'Là từ/cụm từ' : 'Nhập khoá'}
                                    )
                                </Text>
                                <TextInput
                                    key="keyInput"
                                    style={styles.modalInput}
                                    value={encryptionKey}
                                    onChangeText={setEncryptionKey}
                                    placeholder={encryptionMode === 'Caesar' ? '3' : encryptionMode === 'Playfair' ? 'Ví dụ: SECRET' : 'Nhập khóa bí mật'}
                                    placeholderTextColor="#aaa"
                                    keyboardType={encryptionMode === 'Caesar' ? 'number-pad' : 'default'}
                                    maxLength={encryptionMode === 'Caesar' ? 2 : 50}
                                />
                                <View key="info" style={styles.infoBox}>
                                    <Text key="infoIcon" style={styles.infoIcon}>ℹ️</Text>
                                    <Text key="infoText" style={styles.infoText}>
                                        Cả 2 người phải dùng cùng key và cùng chế độ mã hóa để chat được với nhau.
                                    </Text>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                    <TouchableOpacity style={styles.saveButton} onPress={onClose} activeOpacity={0.7}>
                        <Text style={styles.saveButtonText}>✓ Lưu cài đặt</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
});

export default SettingsModal;
