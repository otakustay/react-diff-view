yarn
yarn clean
export NODE_ENV=production
node rollup.js
node node_modules/.bin/postcss -o style/index.css src/styles/index.css
node scripts/fix-css.js style/index.css
