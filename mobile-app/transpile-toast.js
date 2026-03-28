const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

const libDir = '/Users/jdmayorga/Sites/colegio/mobile-app/node_modules/react-native-toast-message/lib';

// Find all .js files recursively
function getFiles(dir, files = []) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getFiles(fullPath, files);
        } else if (fullPath.endsWith('.js')) {
            files.push(fullPath);
        }
    });
    return files;
}

const targetFiles = getFiles(libDir);

targetFiles.forEach(file => {
    console.log('Checking', file);
    const code = fs.readFileSync(file, 'utf8');
    // If it doesn't contain a less-than sign, it likely doesn't have JSX
    if (!code.includes('<')) return;
    console.log('Transpiling JSX in', file);
    try {
        const result = babel.transformSync(code, {
            plugins: [require('@babel/plugin-transform-react-jsx')],
            babelrc: false,
            configFile: false,
            filename: file
        });
        fs.writeFileSync(file, result.code);
    } catch (e) {
        console.error('Failed to parse', file, e.message);
    }
});

console.log('Transpilation complete!');
