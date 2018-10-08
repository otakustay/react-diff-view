# react-diff-view

A git diff component to consume the git unified diff output.

## Overview

### Split view

![split view](https://raw.githubusercontent.com/otakustay/react-diff-view/master/screenshots/split-view.png)

### Unified view

![unified view](https://raw.githubusercontent.com/otakustay/react-diff-view/master/screenshots/unified-view.png)

### Optimized selection

![select only one side](https://raw.githubusercontent.com/otakustay/react-diff-view/master/screenshots/single-side-selection.png)

## Full features

- A clean and small core to display diff.
- Support split (side by side) and unified (one column) views.
- Tolerable performance.
- Flexible decoration component to render custom content around blocks of changes.
- Extensible widget architecture to support code commenting and various requirements.
- Customizable events and styles.
- Powerful token system to enable code highlight, mark special words, inline diff and more, supports web worker.
- A bunch of utility function to manipulate diff structure if source text is provided.

Run `npm start` to enjoy a full featured demo with diff display, collapsed code expansion, code comment and large diff lazy load.

You can modify the `small.diff` to `large.diff` in `demo/App.js` to test the performance, the `large.diff` is a **2.2MB diff file with 375 files changed, 18721 insertions(+), 35671 deletions(-)**, it can possibly hung your computer so use it in caution.

In my laptop (MacBook Pro 15-inch 2016, 2.6 GHz Intel Core i7, 16 GB 2133 MHz LPDDR3) it performs quite slow but tolerable without lazy rendering:

```
parse: 88.73291015625ms
render: 26072.791015625ms
paint: 6199.848876953125ms
```

## Install

```shell
npm install --save react-diff-view
```

## Basic usage

### Parse diff text

For best display effect, you should generate your diff text with `git diff -U1` command.

The `{File[] parseDiff({string} text, {Object} [options])` named export is a wrap of [gitdiff-parser](https://www.npmjs.com/package/gitdiff-parser) package with some extra options:

- `{string} nearbySequences`: The action to take when meet nearby sequences, only the `"zip"` value has its own behavior.

The `nearbySequence` can have a value of `"zip"` to "zip" a sequences of deletion and additions, as an example, here is a diff generated from react:

```diff
-    // if someone has already defined a value bail and don't track value
-    // will cause over reporting of changes, but it's better then a hard failure
-    // (needed for certain tests that spyOn input values)
-    if (node.hasOwnProperty(valueField)) {
+    // if someone has already defined a value or Safari, then bail
+    // and don't track value will cause over reporting of changes,
+    // but it's better then a hard failure
+    // (needed for certain tests that spyOn input values and Safari)
```

This is the normal behavior, which will displaed as 3 lines of deletion, 1 line of modification and 3 lines of addition:

![Normal sequence behavior](https://raw.githubusercontent.com/otakustay/react-diff-view/master/screenshots/sequence-normal.png)

When the value `"zip"` is passed, the diff will be modified to:

```diff
-    // if someone has already defined a value bail and don't track value
+    // if someone has already defined a value or Safari, then bail
-    // will cause over reporting of changes, but it's better then a hard failure
+    // and don't track value will cause over reporting of changes,
-    // (needed for certain tests that spyOn input values)
+    // but it's better then a hard failure
-    if (node.hasOwnProperty(valueField)) {
+    // (needed for certain tests that spyOn input values and Safari)
```

and as a result rendered as:

![Normal sequence behavior](https://raw.githubusercontent.com/otakustay/react-diff-view/master/screenshots/sequence-zip.png)

In most cases it can provide a better look in split view.

### Render diff hunks

The `Diff` named export is a component to render a diff, a simplest case to render a diff could be:

```jsx
import {parseDiff, Diff, Hunk} from 'react-diff-view';

const App = ({diffText}) => {
    const files = parseDiff(diffText);

    const renderFile = ({oldRevision, newRevision, type, hunks}) => (
        <Diff key={oldRevision + '-' + newRevision} viewType="split" diffType={type} hunks={hunks}>
            {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
        </Diff>
    );

    return (
        <div>
            {files.map(renderFile)}
        </div>
    );
};
```

The children is optional if you only need all hunks to be displaed, however you can use this function children to add custome events or classes to hunks.

As you can see, `Diff` component requires a `hunks` prop as well as a function `children` prop which receivs the `hunks` prop as its argument, this may looks redundant but actually very useful when work with HOCs modifying hunks. For example, we have a HOC to remove all normal changes:

```jsx
const filterOuteNormalChanges = hunk => {
    return {
        ...hunk,
        changes: hunk.changes.filter(change => !change.isNormal);
    };
};

const removeNormalChanges = ComponentIn => {
    const ComponentOut = ({hunks, ...props}) => {
        const purgedHunks = hunks.map(filterOutNormalChanges);

        return <ComponentIn {...props} hunks={hunks} />;
    };

    ComponentOut.displayName = `removeNormalChanges(${ComponentIn.displayName})`;

    return ComponentOut;
};

const MyDiff = removeNomalChanges(Diff);
```

We can still pass original `hunks` to `MyDiff`, however all normal changes are removed from the `hunks` argument in `children` prop.

Here is the full list of its props:

- `{Object[] hunks}`: Hunks of diff.
- `{Function} children`: A function which receives an array of hunks and returns react elements.
- `{string} viewType`: Can be either `"unified"` or `"split"` to determine how the diff should look like.
- `{string} className`: An extra css class.
- `{Object} customEvents`: An object containing events for different part, see [Customize events](#customize-events) section for detail.
- `{Object} customClassNames`: An object containing css classes for different part, see [Customize styles](#customize-styles) section for detail.
- `{string[]} selectedChanges`: An array of selected changes's key, these changes will be highlighted.
- `{Object} widgets`: An object of `{changeKey: element}` to render widget for changes, see [Add widgets](#add-widgets) section for detail.
- `{string} gutterType`: How the gutter cell should be rendered, can be either `"default"` to render only the line number, `"none"` to hide the gutter column, or `"anchor"` to render line number as an `<a>` element so user can click gutter to scroll to corresponding line.
- `{Function} generateAnchorID`: A function to generate a DOM `id` attribute for each change, this is required when `gutterType` is set to `"anchor"`. Provided function receives a `change` object as the only argument and should return either a string or `undefined`, if `undefined` is returned no `id` attribute will be placed on DOM. The `id` attribute will be placed on the gutter `<td>` element, for normal changes in split mode, only the left side gutter will have the `id` attribute.
- `{boolean} optimizeSelection`: Whether to optimize selection to a single column, when this prop is set to `true` in split mode, user can only select code from either old or new side, this can help copy and paste lines of code. This feature can cause some performance dropdown when the diff is extremely large, so it is turned off by default.
- `{Function} renderToken`: A function to render customized syntax tokens, see [Pick ranges](#pick-ranges) section for detail.

#### Key of change

In `selectedChanges` and `widgets` props the key of change is used to match a specific change, a change's key is simply a string computed by the following rules:

```javascript
if (change.type === 'insert') {
    return 'I' + change.lineNumber;
}
else if (change.type === 'delete') {
    return 'D' + change.lineNumber;
}
else {
    return 'N' + change.oldLineNumber;
}
```

You are not required to compute this key yourself, the `getChangeKey(change)` exported function will do it.

## Add decoration around hunks

A decoration is customized content rendered around `Hunk` component, pass a `Decoration` element in `Diff`'s `children` is the only required action.

`Decoration` component basically receives a `children` prop which can either have one or two elements:

- A single element: this will be rendered in the entire row.
- An array containing two elements: The first element will be rendered in gutter position, the second will be rendered in code position.

A very simple use case of `Decoration` is to provide a summary infomation of hunk:

```jsx
import {flatMap} from 'lodash';
import {Diff, Hunk, Decoration} from 'react-diff-view';

const renderHunk = hunk => [
    <Decoration key={'decoration-' + hunk.content}>
        {hunk.content}
    </Decoration>,
    <Hunk key={'hunk-' + hunk.content}> hunk={hunk} />
];

const DiffFile = ({diffType, hunks}) => (
    <Diff viewType="split" diffType={diffType}>
        {flatMap(hunks, renderHunk)}
    </Diff>
);
```

We can also render more content by providing two elements to `Decoration`:

```jsx
const renderHunk = hunk => [
    <Decoration key={'decoration-' + hunk.content}>
        <SmileFace />,
        <span>{hunk.content}</span>
    </Decoration>,
    <Hunk key={'hunk-' + hunk.content}> hunk={hunk} />
]
```

## Add widgets

In some cases we need functions like commenting on change, `react-diff-view` provides an extensible solution called **widget** to archive such senarios.

A widget is any react element bound to a change object, a widget is configured in an object with `change` and `element` property, when rendering diff changes, if there is a widget object with the same `change` object, the `element` will be rendered below the line of code.

In split view a widget will be rendered to its corresponding side if change object is of type addition or deletion, otherwise the widget will be rendered across the entire row.

Note although the `widgets` prop is of type array, each change can only render one widget, so if there are entries with the same `change` property, only the first one will be rendered.

Here is a very basic example which adds a warning text on long lines:

```javascript
import {parseDiff, getChangeKey, Diff} from 'react-diff-view';

const getWidgets = ({hunks}) => {
    const changes = hunks.reduce((result, {changes}) => [...result, ...changes], []);
    const longLines = changes.filter(({content}) => content.length > 120);
    return longLines.reduce(
        (widgets, change) => {
            const changeKey = getChangeKey(change);

            return {
                ...widgets,
                [changeKey]: <span className="error">Line too long</span>
            };
        },
        {}
    );
};

const App = ({diffText}) => {
    const files = parseDiff(diffText);

    return (
        <div>
            {files.map(({hunks}, i) => <Diff key={i} hunks={hunks} widgets={getWidgets(hunks)} viewType="split" />)}
        </div>
    );
};
```

For a more complex case, you can reference the example in [demo/File.js](demo/File.js) about implementing code comments with the `widgets` prop.

## Customize styles

The basic theme of `react-diff-view` is simply "picked" from github, with some additional colors for column diffs, the style is bundled with js using [style-loader](https://github.com/webpack-contrib/style-loader) by default, if you want to separate the style, you can build it from the `src` folder, [webpack's `resolve.aliases` configuration](https://webpack.js.org/configuration/resolve/#resolve-alias) can help to archive this.

You can override styles on certian css classes to customize the appearance of `react-diff-view`, here is a list of css classes generated by component:

- `diff`: The diff container, a `<table>` element.
- `diff-gutter-col`: The `<col>` element to control the gutter column.
- `diff-hunk`: The `<tbody>` element representing a diff hunk.
- `diff-decoration`: The `<tr>` element reprensenting the decoration row.
- `diff-decoration-gutter`: The `<td>` element corresponding to gutter within decoration.
- `diff-decoration-content`: The `<td>` element corresponding to code content within decoration.
- `diff-gutter`: The `<td>` element containing the line number.
- `diff-gutter-normal`: Gutter of a normal change.
- `diff-gutter-insert`: Gutter of an addition.
- `diff-gutter-delete`: Gutter of a deletion.
- `diff-gutter-omit`: Gutter with no content.
- `diff-gutter-selected`: Gutter of a selected change.
- `diff-line`: The `<tr>` element for a diff line.
- `diff-line-old-only`: The `<tr>` element which only contains the left side columns, appears in split view
- `diff-line-new-only`: The `<tr>` element which only contains the right side columns, appears in split view
- `diff-code`: The `<td>` element containing code.
- `diff-code-normal`: Code of a normal change.
- `diff-code-insert`: Code of an addition.
- `diff-code-delete`: Code of a deletion.
- `diff-code-omit`: Code with no content.
- `diff-code-selected`: Code of a selected change.
- `diff-code-edit`: Edits on a line of code.
- `diff-code-mark`: Marked word on a line of code.
- `diff-widget`: The `<tr>` element to render widget.
- `diff-widget-content`: The `<td>` element to render widget content.
- `diff-line-hover-old`: The `<td>` element of the old side gutter and code which is currently hovered.
- `diff-line-hover-new`: The `<td>` element of the new side gutter and code which is currently hovered.

The `diff-line-hover-(old|new)` class is especially designed to tell the precise hover element in split mode, so it only applies when `viewType` is set to `"split"`, if you want a style on a hovering change, the selector could be:

```less
// Less selector to disable the line number and add an icon in the gutter element when a change is hovered
.diff-line-hover-old.diff-gutter,
.diff-line-hover-new.diff-gutter,
.diff-unified .diff-line:hover .diff-gutter {
    &::before {
        font-family: "FontAwesome";
        content: "\f4b2"; // comment-plus
    }
}
```

You can pass the `className` prop to a `Diff` component to add a custom class to the `<table>` element.

The `Hunk` component receives class name props as:

- `className`: The class name of hunk's root `<tbody>` element.
- `lineClassName`: The class name of each change's `<tr>` element.
- `gutterClassName`: The class name of the gutter `<td>` element in each row.
- `codeClassName`: The class name of the code `<td>` element in each row.

Similarly `Decoration` component also receives some props to customize class names:

- `className`: The class name of decoration's root `<tr>` element.
- `gutterClassName`: The class name of the gutter `<td>` element.
- `contentClassName`: The class name of the content `<td>` element.

### Customize events

The `Hunk` component receives `gutterEvents` and `codeEvents` props to customize events on either gutter or code `<td>` element.

Both of the above prop is an object containing DOM events key/value pair.

Each event callback receivs an object with key `change` and `side`, the `side` property is `undefined` in unified mode, in split mode it could be either `"old"` and `"new"` responding to the triggering element.

One of the common cases is to add code selecting functionality. This can be archived simply by passing an `onClick` event to gutter and coe and manipulating the `selectedChanges` prop:

```javascript
import {PureComponent} from 'react';
import {bind} from 'lodash-decorators';
import {Diff} from 'react-diff-view';

class File extends PureComponent {
    state = {
        selectedChanges: [],
        gutterEvents: {
            onClick: this.selectChange
        },
        codeEvents: {
            onClick: this.selectChange
        }
    };

    @bind()
    selectChange({change}) {
        const {selectedChanges} = this.state;
        const selected = selectedChanges.includes(change);
        this.setState({selectedChanges: selected ? without(selectedChanges, change) : [...selectedChanges, change]});
    }

    render() {
        const {hunks, diffType} = this.props;
        const {gutterEvents, codeEvents} = this.state;
        const hunkProps = {gutterEvents, codeEvents};

        return (
            <Diff viewType="split" diffType={diffType}>
                {hunk.map(hunk => <Hunk key={hunk.content} hunk={hunk} {...hunkProps} />)}
            </Diff>
        );
    }
}
```

## Token system

Since the version `2.0.0` we introduce a powerful token system to provide enhancements such as code highlighting, special word marking, inline diff edits and more.

The token system is quite complicated internally, so we recommend to use only the exported `tokenize` function to parse and tokenize diffs.

The `tokenize` function accepts 2 arguments, the first is the `hunks` array, the second one is an `options` object containing many optional configurations:

- `{boolean} highlight`: Whether to highlight code syntax.
- `{Object} refractor`: If `highlight` is set to `true`, we require the [refractor](https://github.com/wooorm/refractor) library to highlight code, you can simply pass the default export of `refractor` lib, or [create a custom build of it](https://github.com/wooorm/refractor#browser).
- `{string} oldSource`: When highlight is enabled, it can generate more accurate syntax result when the entire source code is provided. Only the old source code is required, new code will be automatically generated from the diff patch. This is **not** required, however lack of it can result incorrect highlight in cases like multiline comments or template strings.
- `{string} language`: When highlight is enabled, you **must** provide the language of your source code, your `refractor` object should also support the providing language, a list of language can be found [here](https://github.com/wooorm/refractor#syntaxes).
- `{Function[]} enhancers`: A list of enhancers to enhance the result syntax tokens.

The `react-diff-view` also ships with several common enhancers:

### Edits

The `markEdits(hunks, options)` exported function will further diff the old and new text within a hunk, the differences between two sides will be marked a class name `diff-code-edit`.

The `options` object accepts properties:

- `{string} type`: How inline diff should work, the value could be `"line"` to diff texts line by line, or `"block"` (by default) which diffs text with a hunk.

It uses [diff-match-patch](https://www.npmjs.com/package/diff-match-patch) as its internal implement.

### Special words

The `markword(word, name, replacement)` exported function enables you to mark some special word with 2 arguments:

- `{string} word`: The word you want to mark, such as `"\r"` or `"Hello"`.
- `{string} name`: The name of word, such as `"carriage-return"` or `"hello"`.
- `{string} replacement`: The text to replace `word`, for example we can use `"␍"` to replace `"\r"` to make it visible on screen.

Marked word will have a class name of `diff-code-${name}`.

### Pick ranges

The `pickRanges(oldRanges, newRanges)` exported function is a more low level function which helps you to pick some ranges of text from each line.

Each range is an object with properties:

- `{string} type`: The custom type of range, this will be passed to your custom render function.
- `{number} lineNumber`: The line number of this ranges, starting from 1.
- `{number} start`: The starting index within line, starting from 0.
- `{number} length`: The length of range.
- `{object} properties`: Extra properties of range, these properties will be passed to your custom render function.

By giving an array of ranges on both old and new side, the token system will pick them out of each line, you should pass a `renderToken` function prop to `Diff` component to customize your render implement of customzied token. The `renderToken` is a simple function receiving `(token, defaultRender)` as arguments:

```jsx
// Suppose we pick ranges of type `searchResult`
const renderToken = (token, defaultRender, i) => {
    if (token.type === 'searchResult') {
        return (
            <span key={i} className="search-result">
                {token.children && token.children.map((token, i) => renderToken(token, defaultRender, i))}
            </span>
        );
    }

    // For other types, use the default render function
    return defaultRender(token, i);
};
```

We can utilize enhancers to create effects above diffs, for example we want to enable inline diff edits, and highlight tab and carriage return characters, this can be done by:

```jsx
import refractor from 'refractor';

const options = {
    highlight: true,
    refractor: refractor,
    oldSource: oldSource,
    language: 'jsx',
    enhancers: [
        markWord('\r', 'carriage-return'),
        markWord('\t', 'tab'),
        markEdits(hunks)
    ]
};

const tokens = tokenize(hunks, options);
```

The `tokenize` function can work inside a web worker so it does not block the user interface.

## Utilities

`react-diff-view` comes with some utility functions to help simplify common issues:

- `{number} computeOldLineNumber({Change} change)`: Compute the line number in old revision for a change, returns `-1` on insert changes.
- `{number} computeNewLineNumber({Change} change)`: Compute the line number in new revision for a change, returns `-1` on delete changes.
- `{Hunk} textLinesToHunk({string[]} lines, {number} oldStartLineNumber, {number} newStartLineNumber)`: Create a hunk with all normal changes, this is useful when expanding code between two hunks.
- `{Hunk[]} insertHunk({Hunk[]} hunks, {Hunk} insertion)`: Insert a new hunk into the original list, it will merge sibling hunks if possible, useful for expanding code.
- `{number} computeCorrespondingOldLineNumber({Hunk[]} hunks, {number} newLineNumber)`: Get the corresponding old line number by a line number on the new side. This function returns `-1` when no corresponding line exists (pure insert and delete changes).
- `{number} computeCorrespondingNewLineNumber({Hunk[]} hunks, {number} oldLineNumber)`: Opposite to `computeCorrespondingOldLineNumber` function.
- `{Change} findChangeByOldLineNumber({Hunk[]} hunks, {number} oldLineNumber)`: Find the change by a line number on the old side, if none is found, returns `undefined`.
- `{Change} findChangeByNewLineNumber({Hunk[]} hunks, {number} newLineNumber)`: Opposite to `findChangeByNewLineNumber` function.
- `{number} getCollapsedLinesCountBetween({Hunk} previousHunk, {Hunk} nextHunk)`: Get the count of collapsed line between given sibling hunks.

## Enjoy more with raw text provided

Once you can provide a `rawCodeOrLines` object (which can be a string, or an array of lines of code), there are many more utility function you can use to help organize hunks:

- `{Hunk[]} expandFromRawCode({Hunk[]} hunks, {string|string[]} rawCodeOrLines, {number} start, {number} end)`: Create a hunk from source code slicing from `start` to `end`, then insert this hunk into `hunks`, merging with existing hunks are automatically done.
- `{Hunk[]} addStubHunk({Hunk[]} hunks, {string|string[]} referenceRawCodeOrLines)`: This is an overload of `addStubHunk` function, once you provide the second `referenceRawCodeOrLines`, the stub hunk will only be appended when there is more code after the last hunk.
- `{Hunk[]} expandCollapsedBlockBy({Hunk[]} hunks, {string|string[]} rawCodeOrLines, {Function} predicate)`: Iterate over all collapsed block (lines between 2 hunks) and expand those with `predicate` returns `true`. The `predicate` function receives `({number} lines, {number} oldStart, {number} newStart)` as arguments.

## Unsupported

### Wordwrap

No, there isn't a wordwrap configuration. Lines are automatically wrapped by default, and it is almost impossible to implement other wrap styles, unless we choose `table-layout: auto` which critically hinders the performance.

Any solutions for this issue are welcome.

### Test

I don't really know how to test such a complicated and UI centric component, any help is welcome.

## Breaking Changes

### 2.x

- The main module is now `cjs/index.js`, with an ES version at `es/index.js`, style is placed at `style/index.css`.
- `children` prop on `Diff` component is now of type function which receives `hunks` as its argument.
- `diffType` prop on `Diff` component is now required.
- `customClassNames` and `customEvents` props are removed from `Diff` component, instead of it `Hunk` and `Decoration` component receives `xxxClassName` and `xxxEvents`, see [Customize events](#customize-events) and [Customize styles](#customize-styles) sections.
- `hideGutter` and `gutterAnchor` props are merged into `gutterType` prop with 3 values: `"default"`, `"anchor"` and `"none"`.
- `markEdits` and `onRenderCode` props are removed, now the tokenizer system takes all enhancement on code view.
- `parse` module is removed, use named exports from main module instead, tree shaking can be enabled on ES version.
- `stubHunk` options of `parseDiff` function is removed, with the power of `Decoration` component, we no longer need the stub hunk.
- `addStubHunk` function is also removed since `Decoration` component is provided.
- All callbacks defined in `codeEvents` and `gutterEvents` now receivs an object with key `change` and `side`.
- The line number is no longer rendered via a `::before` element and a `data-line-number` attribute, it is an actual child node of the gutter element, `user-select: none` is applied to disable selection.

## Change Log

### 1.0.0

- Move to a self-implement diff parser which is faster and provides more information (binary, chmod, etc...).
- Add a `react-diff-view/parse` module providing 2 named exports: `parseDiff` and `addStubHunk`, this can be used on web workers.
- Styles are now in a standalone `index.css` file with source map support.
- Upgrade `react` and `prop-types` dependency versions to MIT licensed ones, also `react ^16.0.0` is supported.

### 1.1.0

- Remove unofficial styles such as paddings and borders around widgets.
- Introduce class names for widgets.
- Upgrade `gitdiff-parser` to `^0.0.5` to fix a line number issue.

### 1.1.1

- Fix a bug where custom event callbacks on hunk header content are not invoked.
- Fix the broken `insertHunk` function.
- Fix a bug in `nearbySequences: 'zip'` implement.

### 1.2.0

- Add key prop to hunks to improve widget insertion performance.
- Fix a bug where `compute(Old|New)LineNumber` will return a valid line number when given unacceptable change object.

### 1.3.0

- Add `generateAnchorID` and `gutterAnchor` props to allow anchor to specific changes.

### 1.3.1

- Fix an issue where `textLinesToHunk` mistakenly adds an heading whitespace to each line of code.

### 1.3.2

- Update `gitdiff-parser` to fix an issue with whitespace in filename.

### 1.4.0

- Add `expandFromRawCode` function to create hunks from source code.
- Make `insertHunk` work when hunks have overlaps.
- Add `referenceRawCodeOrLines` parameter to `addStubHunk` function to automatically determineswhether a stub hunk is required.
- Add `computeCorresponding(Old|New)LineNumber` functions to get corresponding line number from one side to another side.
- Add `findChangeBy(Old|New)LineNumber` functions to find specific change in hunks.
- Add `getCollapsedLinesCountBetween` function to count collapsed lines between two hunks.
- Add `expandCollapsedBlockBy` function to expand collapsed blocks from a predicate function.
- `stubHunk` option on `parse` function is deprecated.

### 1.4.1

- Fix an edge case in `sliceHunk`.

### 1.4.2

- Update `gitdiff-parser` to fix an issue when there is only one line in diff.

### 1.4.3

- Fix an issue where `sliceHunk` function will remove all insert changes in slice range.

### 1.4.4

- Improve `expandFromRawCode` function to support start from a delete change.
- Simplified `sliceHunk` internal function to have a more stable behavior.

### 1.4.5

- Fix an issue where hunks with insert changes at tail will fail to merge.

### 1.4.6

- Fix a bug computing end line of a hunk

### 1.4.7

- Fix a bug where isTextHunk property get the wrong value when merged.
- Fix a bug where code expanding range includes insert or delete change results incorrect hunks.

### 1.4.8

- Fix a bug missing argument to compute valid expand ranges.

### 1.4.9

- Fix incorrect content property on custom hunks.
- Fix a bug where edge insert changes can be omitted when merge.

### 1.4.10

- Fix a logic bug when split range of lines into valid ones.

### 1.4.11

- Fix a bug where a stub hunk will crash the hunk insertion.

### 1.5.0

- Add `hideGutter` prop to hide gutter columns

### 1.6.0

- Enable optimized selection to select only one side in split view, a `optimizeSelection` prop is added.

### 1.6.1

- Optimize performance of column selection.

### 1.6.2

- Fix an issue where click on hunk header can cause error because optimized selection doesn't handle clicks in non code cells.
