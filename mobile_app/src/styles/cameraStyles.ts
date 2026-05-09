import { StyleSheet } from 'react-native';
import { theme } from './theme';
import { scale, verticalScale, moderateScale } from '../utils/responsive';

export const cameraStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: scale(24),
        paddingTop: scale(32),
        alignItems: 'center',
        backgroundColor: theme.colors.primaryLight,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    content: {
        flex: 1,
        padding: scale(16),
    },
    sectionTitle: {
        fontSize: moderateScale(16),
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: verticalScale(8),
        marginTop: verticalScale(16),
    },
    mediaContainer: {
        width: '100%',
        aspectRatio: 16 / 9,
        backgroundColor: theme.colors.black,
        borderRadius: scale(8),
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: verticalScale(24),
    },
    button: {
        backgroundColor: theme.colors.primary,
        padding: scale(16),
        borderRadius: scale(8),
        alignItems: 'center',
        flex: 1,
        marginHorizontal: scale(4),
    },
    buttonText: {
        color: theme.colors.white,
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    },
    errorText: {
        color: theme.colors.danger,
        marginTop: verticalScale(4),
        fontSize: moderateScale(14),
        textAlign: 'center',
    },
    placeholderText: {
        color: theme.colors.white,
        fontSize: moderateScale(14),
    },

    // ── Camera Card List ──
    cameraList: {
        marginBottom: verticalScale(24),
    },
    cameraCard: {
        width: scale(140),
        height: verticalScale(100),
        backgroundColor: theme.colors.white,
        borderRadius: scale(12),
        padding: scale(10),
        marginRight: scale(12),
        borderWidth: 2,
        borderColor: 'transparent',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cameraCardActive: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    cameraCardTitle: {
        fontSize: moderateScale(14),
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    cameraCardStatus: {
        fontSize: moderateScale(11),
        color: theme.colors.textSecondary,
    },
    addCard: {
        width: scale(100),
        height: verticalScale(100),
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        borderRadius: scale(12),
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addCardText: {
        color: theme.colors.primary,
        fontSize: moderateScale(12),
        fontWeight: 'bold',
        marginTop: verticalScale(4),
    },

    // ── Modal ──
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: scale(20),
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderRadius: scale(20),
        padding: scale(25),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalTitle: {
        fontSize: moderateScale(20),
        fontWeight: 'bold',
        marginBottom: verticalScale(20),
        color: theme.colors.text,
    },
    inputGroup: {
        marginBottom: verticalScale(15),
    },
    inputLabel: {
        fontSize: moderateScale(14),
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: verticalScale(8),
    },
    input: {
        backgroundColor: '#F5F7FA',
        borderRadius: scale(12),
        padding: scale(12),
        fontSize: moderateScale(14),
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: '#E1E8F0',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: verticalScale(20),
        gap: scale(10),
    },
    modalButton: {
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(20),
        borderRadius: scale(10),
    },
});
