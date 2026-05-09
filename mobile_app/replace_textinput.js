const fs = require('fs');
const path = require('path');

function getFiles(dir, files_) {
    files_ = files_ || [];
    const files = fs.readdirSync(dir);
    for (const i in files) {
        const name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            if (name.endsWith('.tsx') || name.endsWith('.ts')) {
                files_.push(name);
            }
        }
    }
    return files_;
}

const allFiles = getFiles('./src');

let count = 0;
allFiles.forEach(file => {
    // ข้ามไฟล์ Custom TextInput เอง
    if (file.includes('CustomTextInput.tsx')) return;
    if (file.includes('CustomText.tsx')) return;

    let content = fs.readFileSync(file, 'utf8');

    // ตรวจสอบว่ามี TextInput ถูกใช้หรือนำเข้าไหม
    if (content.includes("from 'react-native'")) {
        // หาบรรทัดที่มี import { ... TextInput ... } from 'react-native'
        const importRegex = /import\s+{[^}]*\bTextInput\b[^}]*}\s+from\s+['"]react-native['"]\s*;/g;
        const matches = content.match(importRegex);

        if (matches) {
            matches.forEach(match => {
                // เอา TextInput ออกจากวงเล็บ
                let newImport = match.replace(/\bTextInput\b\s*,?\s*/g, '');
                
                // ถ้านำเข้าแค่ TextInput อย่างเดียว วงเล็บจะว่าง เช่น import { } from 'react-native';
                newImport = newImport.replace(/\{\s*,?\s*\}/g, '');
                
                const depth = file.split('/').length - 3; 
                const relativePath = depth === 0 ? './components/CustomTextInput' : 
                                     '../'.repeat(depth) + 'components/CustomTextInput';

                if (newImport.match(/import\s+from\s+['"]react-native['"]\s*;/)) {
                     newImport = '';
                }

                // แทนที่ import เดิม
                content = content.replace(match, `${newImport}\nimport TextInput from '${relativePath}';`);
            });

            fs.writeFileSync(file, content, 'utf8');
            count++;
            console.log("Updated TextInput in:", file);
        }
    }
});

console.log(`Finished updating ${count} files for TextInput.`);
