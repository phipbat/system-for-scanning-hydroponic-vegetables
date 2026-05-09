import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../components/CustomText';
import { theme } from '../styles/theme';

interface HeroProps {
    title: string;
    subtitle?: string;
}

const Hero: React.FC<HeroProps> = ({ title, subtitle }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: theme.spacing.xl,
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 16,
        marginVertical: theme.spacing.md,
    },
    title: {
        fontSize: theme.typography.fontSize.xl,
        fontWeight: 'bold',
        color: theme.colors.black,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xs,
    },
});

export default Hero;
