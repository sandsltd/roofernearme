const fs = require('fs');
const path = require('path');

// Read roofers.json
const roofersData = require('../src/data/roofers.json');
const logosDir = path.join(__dirname, '../public/logos');

console.log('\nValidating logo paths...\n');

let hasErrors = false;

// Check each roofer's logo
roofersData.roofers.forEach(roofer => {
    const logoPath = roofer.logo.replace('/logos/', '');
    const fullPath = path.join(logosDir, logoPath);
    
    if (!fs.existsSync(fullPath)) {
        console.error(`❌ Error: Logo not found for ${roofer.businessName}`);
        console.error(`   Expected at: ${fullPath}`);
        console.error(`   JSON path: ${roofer.logo}\n`);
        hasErrors = true;
    } else {
        console.log(`✅ Logo verified for ${roofer.businessName}`);
    }
});

if (hasErrors) {
    console.error('\n⚠️  Some logos are missing! Please fix the issues above.');
    process.exit(1);
} else {
    console.log('\n✨ All logos verified successfully!');
} 