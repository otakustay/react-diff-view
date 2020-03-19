yarn
yarn clean
export NODE_ENV=production
node rollup.js
postcss -o style/index.css src/styles/index.css
sed -i '' 's/}/;}/g' style/index.css
