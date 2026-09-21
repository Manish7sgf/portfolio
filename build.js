const fs = require('fs');
const JavaScriptObfuscator = require('javascript-obfuscator');

console.log("Reading src/index.html...");
const htmlContent = fs.readFileSync('src/index.html', 'utf8');

console.log("Encoding HTML to base64...");
const b64Html = Buffer.from(htmlContent, 'utf8').toString('base64');

// The bootstrap code that will decode and inject the HTML
const bootstrapCode = `
    const b64 = "${b64Html}";
    const binaryString = atob(b64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const decodedHtml = new TextDecoder('utf-8').decode(bytes);
    document.open();
    document.write(decodedHtml);
    document.close();
`;

const obfuscationResult = JavaScriptObfuscator.obfuscate(bootstrapCode, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.5,
    numbersToExpressions: true,
    simplify: true,
    stringArray: false, // Disable string array for massive base64 string
    splitStrings: false // Disable string splitting to prevent OOM
});

const finalJs = obfuscationResult.getObfuscatedCode();

const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Manish Varman - Portfolio</title>
    <style>
        body { background: #080808; margin: 0; padding: 0; }
    </style>
</head>
<body>
    <script>
        ${finalJs}
    </script>
</body>
</html>`;

console.log("Writing protected index.html...");
fs.writeFileSync('index.html', finalHtml);
console.log("Build complete! The portfolio is now fully protected.");
