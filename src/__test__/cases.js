/* In case you are looking for type of hunk, see src/Hunk/index.js */
import {parseDiff} from '..';

export const basic = `diff --git a/src/__test__/index.test.jsx b/src/__test__/index.test.jsx
index 643c2f0..7883597 100644
--- a/src/__test__/index.test.jsx
+++ b/src/__test__/index.test.jsx
@@ -21,3 +21,3 @@ describe('basic test', () => {
     test('App renders correctly', () => {
-        expect(renderer.create(<App diffText={'deff'} />).toJSON()).toMatchSnapshot();
+        expect(renderer.create(<App diffText={'diff'} />).toJSON()).toMatchSnapshot();
     });`;

export const basicHunk = parseDiff(basic)[0].hunks[0];

export const multiple = `diff --git a/src/index1.js b/src/index1.js
index e69de29..d00491f 100644
--- a/src/index1.js
+++ b/src/index1.js
@@ -0,0 +1 @@
+1
diff --git a/src/index.js b/src/index2.js
index d00491f..0cfbf08 100644
--- a/src/index2.js
+++ b/src/index2.js
@@ -1 +1 @@
-1
+2
diff --git a/src/index3.js b/src/index3.js
index 0cfbf08..e69de29 100644
--- a/src/index3.js
+++ b/src/index3.js
@@ -1 +0,0 @@
-2`;

export const multipleHunk = parseDiff(basic)[0].hunks[0];
