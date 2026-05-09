import { StyleSheet } from 'react-native';
import { theme } from './theme';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    // ── Header Custom Button ──
    addBtnHeader: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },

    // ── Image Picker Modal Style ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'flex-end', // Slide from bottom feel
    },
    modalBox: {
        backgroundColor: '#fff',
        borderTopLeftRadius: scale(32),
        borderTopRightRadius: scale(32),
        padding: scale(24),
        paddingBottom: verticalScale(40),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(24),
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: '900',
        color: '#1E293B',
    },
    imagePickerRow: {
        flexDirection: 'row',
        gap: scale(16),
    },
    imgPickBtn: {
        flex: 1,
        height: verticalScale(140),
        borderRadius: scale(24),
        borderWidth: 2,
        borderColor: '#F1F5F9',
        borderStyle: 'dashed',
        backgroundColor: '#FCFDFF',
        alignItems: 'center',
        justifyContent: 'center',
        gap: verticalScale(12),
    },
    imgPickIconCircle: {
        width: scale(60),
        height: scale(60),
        borderRadius: scale(30),
        backgroundColor: '#F0FDF4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imgPickText: {
        fontSize: moderateScale(15),
        fontWeight: '800',
        color: '#475569',
    },

    // ── History Section ──
    histSection: {
        marginTop: verticalScale(10),
    },
    histHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(20),
    },
    histIconCircle: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    histTitle: {
        fontSize: moderateScale(18),
        fontWeight: '800',
        color: '#1A1A2E',
    },
    histCountBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(5),
        borderRadius: scale(20),
    },
    histCountText: {
        fontSize: moderateScale(13),
        color: '#64748B',
        fontWeight: '700',
    },
    histRow: {
        justifyContent: 'flex-start',
        gap: scale(8),
        marginBottom: verticalScale(12),
    },
    histCard: {
        width: (scale(375) - scale(40) - scale(24)) / 4,
        backgroundColor: '#fff',
        borderRadius: scale(16),
        padding: scale(6),
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    histCardInner: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: scale(12),
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
    },
    histImg: {
        width: '100%',
        height: '100%',
    },
    histStatusBadge: {
        position: 'absolute',
        top: scale(4),
        right: scale(4),
        width: scale(12),
        height: scale(12),
        borderRadius: scale(6),
        borderWidth: 1.5,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    histCardMeta: {
        marginTop: verticalScale(8),
        alignItems: 'center',
    },
    histDateText: {
        fontSize: moderateScale(9),
        color: '#94A3B8',
        fontWeight: '700',
        marginBottom: 2,
    },
    histStatusText: {
        fontSize: moderateScale(10),
        fontWeight: '800',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(60),
    },
    emptyIconCircle: {
        width: scale(80),
        height: scale(80),
        borderRadius: scale(40),
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: verticalScale(20),
    },
    emptyTitle: {
        fontSize: moderateScale(18),
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: verticalScale(8),
    },
    emptySubTitle: {
        fontSize: moderateScale(14),
        color: '#94A3B8',
        textAlign: 'center',
        paddingHorizontal: scale(40),
    },
});
