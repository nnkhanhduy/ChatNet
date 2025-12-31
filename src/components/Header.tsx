import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Platform,
} from 'react-native';
import {
    scale,
    verticalScale,
    moderateScale,
    responsiveFontSize
} from '../utils/responsive';

interface HeaderProps {
    onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
    return (
        <View style={styles.header}>
            <Text style={styles.title}>💬 ChatNET</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={onOpenSettings} activeOpacity={0.7}>
                <Image
                    source={require('../../assets/setting.png')}
                    style={styles.settingsIcon}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
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
});

export default Header;
