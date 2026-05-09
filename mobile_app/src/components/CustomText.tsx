import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

const CustomText: React.FC<TextProps> = ({ style, ...props }) => {
    const flatStyle = { ...StyleSheet.flatten(style || {}) } as any;
    
    // ตรวจสอบระดับความหนา (Weight) อัตโนมัติจาก Stylesheet เดิม
    const weight = flatStyle.fontWeight;
    const isBold = weight === 'bold' || weight === '700' || weight === '800' || weight === '900';
    const isSemiBold = weight === '600';
    const isMedium = weight === '500';
    
    let fontFamily = 'Prompt_400Regular';
    
    if (isBold || isSemiBold) {
        fontFamily = 'Prompt_700Bold';
    } else if (isMedium) {
        fontFamily = 'Prompt_500Medium';
    }

    // ลบ fontWeight ออกเพื่อป้องกันบั๊กใน Android ที่มักจะตัด custom font ทิ้งถ้ามี fontWeight ผสมอยู่
    delete flatStyle.fontWeight;
    delete flatStyle.fontStyle;

    return (
        <Text 
            {...props} 
            style={[
                flatStyle, 
                { fontFamily }
            ]} 
        />
    );
};

export default CustomText;
