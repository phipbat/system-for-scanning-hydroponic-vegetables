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
    // ข้ามไฟล์ CustomText.tsx เอง
    if (file.includes('CustomText.tsx')) return;

    let content = fs.readFileSync(file, 'utf8');

    // ตรวจสอบว่ามี <Text> ถูกใช้หรือนำเข้าไหม
    if (content.includes("from 'react-native'")) {
        // หาบรรทัดที่มี import { ... Text ... } from 'react-native'
        const importRegex = /import\s+{[^}]*\bText\b[^}]*}\s+from\s+['"]react-native['"]\s*;/g;
        const matches = content.match(importRegex);

        if (matches) {
            matches.forEach(match => {
                // เอา Text ออกจากวงเล็บ
                let newImport = match.replace(/\bText\b\s*,?\s*/g, '');
                
                // ถ้านำเข้าแค่ Text อย่างเดียว วงเล็บจะว่าง เช่น import { } from 'react-native';
                newImport = newImport.replace(/\{\s*,?\s*\}/g, '');
                
                // คำนวณ path กลับไปที่ src/components/CustomText
                const depth = file.split('/').length - 3; // ./src = 2, so depth relative to src
                const relativePath = depth === 0 ? './components/CustomText' : 
                                     '../'.repeat(depth) + 'components/CustomText';

                // ถ้าบังเอิญลบจนเหลือแค่ import from 'react-native'; ให้ลบไปเลย
                if (newImport.match(/import\s+from\s+['"]react-native['"]\s*;/)) {
                     newImport = '';
                }

                // แทนที่ import เดิม
                content = content.replace(match, `${newImport}\nimport Text from '${relativePath}';`);
            });

            fs.writeFileSync(file, content, 'utf8');
            count++;
            console.log("Updated:", file);
        }
    }
});

console.log(`Finished updating ${count} files.`);
