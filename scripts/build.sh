yarn
yarn clean
export NODE_ENV=production
node rollup.js
node node_modules/.bin/postcss -o style/index.css src/styles/index.css
sed -i 's/}/;}/g' style/index.css
