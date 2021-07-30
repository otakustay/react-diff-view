const fs = require('fs');

const content = fs.readFileSync(process.argv[2], 'utf-8');
fs.writeFileSync(process.argv[2], content.replace(/\}/g, ';}'));
