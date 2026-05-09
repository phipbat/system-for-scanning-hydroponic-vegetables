import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../styles/theme';

interface OverlayProps {
    style?: ViewStyle;
    children?: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ style, children }) => {
    return <View style={[styles.overlay, style]}>{children}</View>;
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Overlay;
