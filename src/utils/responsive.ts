import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const isSmallScreen = SCREEN_HEIGHT < 700;
export const isNarrowScreen = SCREEN_WIDTH < 360;

export const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / 667) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

export const responsiveFontSize = (size: number) => {
    const scaledSize = moderateScale(size, 0.3);
    return Math.max(Math.min(scaledSize, size * 1.2), size * 0.85);
};

export { SCREEN_WIDTH, SCREEN_HEIGHT };
