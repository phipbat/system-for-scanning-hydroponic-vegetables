import { StyleSheet } from 'react-native';
import { theme } from './theme';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        padding: scale(16),
    },

    // ── Loading / Empty ──
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20),
    },
    loadingText: {
        marginTop: verticalScale(12),
        color: theme.colors.textSecondary,
        fontSize: moderateScale(16),
    },
    emptyText: {
        marginTop: verticalScale(16),
        color: theme.colors.text,
        fontSize: moderateScale(18),
        fontWeight: '600',
    },
    emptySubtext: {
        marginTop: verticalScale(8),
        color: theme.colors.textSecondary,
        fontSize: moderateScale(14),
    },

    // ── Card ──
    card: {
        backgroundColor: theme.colors.white,
        borderRadius: scale(16),
        marginBottom: verticalScale(16),
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardBorder: {
        width: scale(6),
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: scale(16),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    cameraTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
        borderRadius: scale(6),
    },
    cameraTagText: {
        marginLeft: scale(4),
        fontSize: moderateScale(12),
        color: theme.colors.text,
        fontWeight: '500',
    },
    timeText: {
        fontSize: moderateScale(12),
        color: theme.colors.textSecondary,
    },
    mainInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: verticalScale(12),
    },
    statusIcon: {
        marginRight: scale(12),
        marginTop: verticalScale(2),
    },
    plantName: {
        fontSize: moderateScale(18),
        color: theme.colors.text,
        fontWeight: '600',
        marginBottom: verticalScale(4),
    },
    healthStatus: {
        fontSize: moderateScale(15),
        lineHeight: verticalScale(22),
    },
    recommendationText: {
        fontSize: moderateScale(13),
        color: theme.colors.text,
        marginTop: verticalScale(4),
        fontStyle: 'italic',
        backgroundColor: theme.colors.background,
        padding: scale(4),
        borderRadius: scale(4),
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: verticalScale(12),
    },
    confidenceText: {
        fontSize: moderateScale(13),
        color: theme.colors.textSecondary,
    },
    severityBadge: {
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        borderRadius: scale(12),
    },
    severityText: {
        fontSize: moderateScale(12),
        fontWeight: '600',
    },
});
