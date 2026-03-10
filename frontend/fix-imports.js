const fs = require('fs');
const path = require('path');

const baseDir = path.resolve('d:/go-gin/frontend/src/pages');
const subDirs = ['auth', 'shop', 'user', 'driver', 'admin', 'seller'];

subDirs.forEach(subDir => {
    const dirPath = path.join(baseDir, subDir);
    if (!fs.existsSync(dirPath)) return;

    fs.readdirSync(dirPath).forEach(file => {
        if (!file.endsWith('.jsx')) return;
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Replace imports to go one level higher since we moved them into subfolders
        content = content.replace(/from\s+['"]\.\.\/(components|services|context|layouts|assets|pages)/g, "from '../../$1");

        // Fix SellerDashboard specifically so it doesn't crash on undefined 'products' array
        if (file === 'SellerDashboard.jsx') {
            content = content.replace(/const productsData = results\[1\]\.status === 'fulfilled' \? results\[1\]\.value\.data : { products: \[\] };/,
                "let pData = results[1].status === 'fulfilled' ? results[1].value.data : [];\n            const productsData = Array.isArray(pData) ? pData : (pData?.products || []);");
            content = content.replace(/setProducts\(productsData\.products \|\| \[\]\);/, "setProducts(productsData || []);");

            content = content.replace(/products\.length/g, "(products?.length || 0)");
            content = content.replace(/products\.reduce/g, "(products || []).reduce");
            content = content.replace(/products\.map/g, "(products || []).map");
        }

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated ${subDir}/${file}`);
        }
    });
});
console.log("All imports and critical crashes fixed!");
