yarn
export NODE_ENV=production
rm -rf cjs/ && tsc
rm -rf es/ && tsc --project tsconfig.es.json
postcss -o cjs/style/index.css src/styles/index.css
node scripts/fix-css.js cjs/style/index.css
postcss -o es/style/index.css src/styles/index.css
node scripts/fix-css.js es/style/index.css
