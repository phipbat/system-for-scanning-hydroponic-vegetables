import { StyleSheet } from 'react-native';
import { theme } from './theme';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

export const styles = StyleSheet.create({

    // ── Layout ──
    screen: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingHorizontal: scale(18),
        paddingTop: verticalScale(8),
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(10),
        backgroundColor: theme.colors.background,
    },
    headerBack: {
        width: scale(44),
        height: scale(44),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: scale(22),
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: moderateScale(17),
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    headerSub: {
        fontSize: moderateScale(11),
        color: theme.colors.primary,
        marginTop: verticalScale(1),
    },

    // ── Image Card ──
    imageCard: {
        width: '100%',
        aspectRatio: 4 / 3,
        borderRadius: scale(20),
        overflow: 'hidden',
        backgroundColor: '#111',
        marginBottom: verticalScale(14),
    },
    imageCardImg: {
        width: '100%',
        height: '100%',
    },
    imageAnalyzingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: verticalScale(10),
    },
    scanPulse: {
        position: 'absolute',
        width: scale(160),
        height: scale(160),
        borderRadius: scale(80),
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    scanText: {
        color: '#fff',
        fontSize: moderateScale(14),
        fontWeight: '600',
        marginTop: verticalScale(8),
    },
    imageBadge: {
        position: 'absolute',
        bottom: verticalScale(10),
        right: scale(10),
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: scale(20),
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(4),
        gap: scale(4),
    },
    imageBadgeText: {
        color: '#fff',
        fontSize: moderateScale(11),
        fontWeight: '600',
    },

    // ── Pre-analyze panel ──
    prePanel: {
        gap: verticalScale(14),
        marginBottom: verticalScale(6),
    },
    thumbRow: {
        gap: scale(10),
        paddingRight: scale(4),
    },
    thumb: {
        position: 'relative',
    },
    thumbImg: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(12),
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    thumbRemove: {
        position: 'absolute',
        top: verticalScale(-5),
        right: scale(-5),
        backgroundColor: '#ef4444',
        width: scale(18),
        height: scale(18),
        borderRadius: scale(9),
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbAdd: {
        width: scale(64),
        height: scale(64),
        borderRadius: scale(12),
        backgroundColor: theme.colors.primaryLight,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbAddText: {
        color: theme.colors.primary,
        fontSize: moderateScale(10),
        fontWeight: '600',
        marginTop: verticalScale(1),
    },
    analyzeBtn: {
        width: '100%',
        height: verticalScale(54),
        borderRadius: scale(16),
        overflow: 'hidden',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    analyzeBtnGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
    },
    analyzeBtnText: {
        color: '#fff',
        fontSize: moderateScale(16),
        fontWeight: 'bold',
    },

    // ── Loading box ──
    loadingBox: {
        alignItems: 'center',
        paddingVertical: verticalScale(32),
        gap: verticalScale(8),
    },
    loadingTitle: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginTop: verticalScale(6),
    },
    loadingSub: {
        fontSize: moderateScale(13),
        color: '#888',
    },

    // ── Result ──
    resultBox: {
        gap: verticalScale(12),
    },

    // Summary Card
    summaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        borderRadius: scale(18),
        padding: scale(14),
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    summaryIconBox: {
        width: scale(42),
        height: scale(42),
        borderRadius: scale(13),
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    summaryInfo: {
        flex: 1,
    },
    plantName: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: theme.colors.primaryDark,
        marginBottom: verticalScale(3),
    },
    confidenceText: {
        fontSize: moderateScale(11),
        color: theme.colors.primary,
        fontWeight: '600',
    },
    healthBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(5),
        borderRadius: scale(10),
    },
    healthBadgeText: {
        fontSize: moderateScale(11),
        fontWeight: 'bold',
    },

    // Stats
    statsScroll: {
        gap: scale(10),
        paddingRight: scale(4),
    },
    statCard: {
        width: scale(74),
        backgroundColor: '#fff',
        borderRadius: scale(14),
        paddingVertical: verticalScale(12),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    statValue: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: '#1a1a2e',
    },
    statUnit: {
        fontSize: moderateScale(10),
        color: theme.colors.primary,
        fontWeight: '600',
        marginTop: verticalScale(1),
    },
    statLabel: {
        fontSize: moderateScale(10),
        color: '#999',
        marginTop: verticalScale(3),
    },

    // Analysis Section
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
    },
    sectionTitle: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    verdictBox: {
        backgroundColor: '#F8F9FA',
        borderRadius: scale(14),
        padding: scale(14),
    },

    // Action buttons
    chatBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: scale(14),
        height: verticalScale(52),
        gap: scale(8),
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    chatBtnText: {
        color: '#fff',
        fontSize: moderateScale(15),
        fontWeight: 'bold',
    },
    bottomActions: {
        flexDirection: 'row',
        gap: scale(10),
    },
    resetBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(6),
        height: verticalScale(46),
        backgroundColor: '#fff',
        borderRadius: scale(12),
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    resetBtnText: {
        color: '#555',
        fontWeight: '600',
        fontSize: moderateScale(13),
    },
    homeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(6),
        height: verticalScale(46),
        backgroundColor: '#F5F5F5',
        borderRadius: scale(12),
    },
    homeBtnText: {
        color: '#555',
        fontWeight: '600',
        fontSize: moderateScale(13),
    },

    // ── Info Cards (ปัญหา + วิธีแก้) ──
    infoRow: {
        flexDirection: 'row',
        gap: scale(10),
    },
    infoCard: {
        flex: 1,
        borderRadius: scale(14),
        padding: scale(12),
        gap: verticalScale(6),
        minHeight: verticalScale(120),
    },
    infoCardWarn: {
        backgroundColor: '#fff8f1',
        borderWidth: 1,
        borderColor: '#fed7aa',
    },
    infoCardGreen: {
        backgroundColor: theme.colors.primaryLight,
        borderWidth: 1,
        borderColor: '#C8E6C9',
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(4),
        marginBottom: verticalScale(2),
    },
    infoCardTitle: {
        fontSize: moderateScale(11),
        fontWeight: 'bold',
    },
    infoProblemText: {
        fontSize: moderateScale(11),
        color: '#78350f',
        fontWeight: '600',
        marginBottom: verticalScale(2),
    },
    infoBulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: scale(5),
    },
    infoDot: {
        width: scale(5),
        height: scale(5),
        borderRadius: scale(3),
        marginTop: verticalScale(5),
        flexShrink: 0,
    },
    infoBulletText: {
        flex: 1,
        fontSize: moderateScale(10),
        color: '#374151',
        lineHeight: verticalScale(16),
    },

    // ── Markdown (fallback) ──
    mdBase: {
        fontSize: moderateScale(14),
        lineHeight: verticalScale(22),
        color: '#374151',
    },
    mdHeader: {
        fontWeight: 'bold',
        fontSize: moderateScale(15),
        marginTop: verticalScale(10),
        marginBottom: verticalScale(2),
        color: '#111827',
    },
    mdEmptyLine: {
        height: verticalScale(5),
    },
    mdBulletRow: {
        flexDirection: 'row',
        marginBottom: verticalScale(3),
    },
    mdBulletDot: {
        color: theme.colors.primary,
        marginRight: scale(7),
        marginTop: verticalScale(1),
    },
    mdNumberDot: {
        color: theme.colors.primary,
        marginRight: scale(7),
        minWidth: scale(20),
    },
});
