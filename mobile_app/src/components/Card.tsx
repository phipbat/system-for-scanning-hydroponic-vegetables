import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../components/CustomText';
import { theme } from '../styles/theme';

interface CardProps {
    title: string;
    description: string;
}

const Card: React.FC<CardProps> = ({ title, description }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.white,
        padding: theme.spacing.md,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.md,
        shadowColor: theme.colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: theme.typography.fontSize.md,
        fontWeight: 'bold',
        color: theme.colors.black,
        marginBottom: theme.spacing.xs,
    },
    description: {
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textSecondary,
    },
});

export default Card;
