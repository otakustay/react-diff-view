import {basic} from '../../__test__/cases';
import {parseDiff} from '..';

describe('parseDiff', () => {
    test('ensure test case', () => {
        expect(parseDiff(basic)).toMatchSnapshot();
        expect(parseDiff(`\n${basic}`)).toMatchSnapshot();
    });

    test('insert', () => {
        const diff = `diff --git a/src/common/utils/languages.js b/src/common/utils/languages.js
index 1eadcc9..022bfd4 100644
--- a/src/common/utils/languages.js
+++ b/src/common/utils/languages.js
@@ -155,5 +155,6 @@
 const genericExtension = new Set(['.tpl', '.tmp']);
 export const detectLanguage = filename => {
+    // 仅仅是为了处理特殊情况，特殊情况应该已经处理完毕
     if (!filename) {
         return 'text';
     }`;
        expect(parseDiff(diff, {nearbySequences: 'zip'})).toMatchSnapshot();
    });

    test('unidiff', () => {
        const diff = `--- x.js 2002-02-21 23:30:39.942229878 -0800
+++ x.js 2002-02-21 23:30:50.442260588 -0800
@@ -155,5 +155,6 @@
 const genericExtension = new Set(['.tpl', '.tmp']);
 export const detectLanguage = filename => {
+    // 仅仅是为了处理特殊情况，特殊情况应该已经处理完毕
     if (!filename) {
         return 'text';
     }`;
        expect(parseDiff(diff, {nearbySequences: 'zip'})).toMatchSnapshot();
    });

    test('rename', () => {
        const diff = `diff --git a/src/error/components/ErrorBase.jsx b/src/components/ErrorPages/ErrorBase.jsx
similarity index 100%
rename from src/error/components/ErrorBase.jsx
rename to src/components/ErrorPages/ErrorBase.jsx`;
        expect(parseDiff(diff, {nearbySequences: 'zip'})).toMatchSnapshot();
    });

    test('no newline at end of file', () => {
        const diff = `diff --git a/README.md b/README.md
index 36f6985..9acdf95 100644
--- a/README.md
+++ b/README.md
@@ -1,2 +1,2 @@
 iiiiiiiiiiiiiiiiiiiiii:WQiiiiiiiiiiiiejj
-dsds
\\ No newline at end of file
+dsdsds
\\ No newline at end of file`;
        expect(parseDiff(diff, {nearbySequences: 'zip'})).toMatchSnapshot();
    });

});
