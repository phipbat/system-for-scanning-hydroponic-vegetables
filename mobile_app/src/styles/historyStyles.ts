import { StyleSheet } from 'react-native';
import { theme } from './theme';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    clearBtnDark: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    listContent: {
        padding: scale(16),
        paddingBottom: verticalScale(30),
    },

    // ── Card ──
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: scale(14),
        marginBottom: verticalScale(12),
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(12),
    },
    thumbnail: {
        width: scale(56),
        height: scale(56),
        borderRadius: scale(10),
        backgroundColor: theme.colors.border,
        marginRight: scale(12),
    },
    cardInfo: {
        flex: 1,
    },
    cardDate: {
        fontSize: moderateScale(13),
        color: theme.colors.textSecondary,
        marginBottom: verticalScale(4),
    },
    cardPreview: {
        fontSize: moderateScale(14),
        color: '#444',
        lineHeight: verticalScale(20),
    },

    // ── Expanded ──
    expandedContent: {
        padding: scale(12),
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    fullImage: {
        width: '100%',
        height: verticalScale(200),
        borderRadius: scale(10),
        marginVertical: verticalScale(10),
        backgroundColor: theme.colors.border,
    },
    resultText: {
        fontSize: moderateScale(14),
        color: '#333',
        lineHeight: verticalScale(21),
        marginBottom: verticalScale(12),
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
    },
    chatButton: {
        flex: 1,
        backgroundColor: theme.colors.primary,
        padding: scale(11),
        borderRadius: scale(8),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(6),
    },
    chatButtonText: {
        color: theme.colors.white,
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    },
    deleteButton: {
        padding: scale(11),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: theme.colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Empty State ──
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: scale(10),
    },
    emptyText: {
        fontSize: moderateScale(18),
        color: '#999',
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: moderateScale(14),
        color: '#bbb',
    },
});
