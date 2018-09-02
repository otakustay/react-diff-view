## Helpful HOCs

To ensure that our users can build a powerful diff component with ease, `react-diff-view` is shipped with several helpful HOCs, each of them provides a straightforward way to implement common use case.

### Manage selection of changes

The `withChangeSelect` HOC can help with managing selection of changes with parameters:

- `{Object} options`: An option object.
    - `{boolean} options.multiple = false`: Whether to enable user selecting multiple changes at the same time.

Two extra props are passed down to wrapped component:

- `{string[]} selectedChanges`: Selected change keys.
- `{Function} onToggleChangeSelection`: Callback to toggle selection on a change.

If we want user to select multiple changes by clicking the code area:

```jsx
import {Diff, Hunk, withChangeSelect} from 'react-diff-view';

const DiffView = ({hunks, selectedChanges, onToggleChangeSelection}) => {
    const codeEvents = {
        onClick: onToggleChangeSelection
    };
    const renderHunk = hunk => (
        <Hunk
            key={hunk.content}
            hunk={hunk}
            codeEvents={codeEvents}
        />
    );

    return (
        <Diff hunks={hunks} selectedChanges={selectedChange}>
            {hunks => hunks.map(renderHunk)}
        </Diff>
    );
};

<DiffView ... />
```

### Expand small collapsed blocks by default

The `minCollapsedLines` HOC is used to automatically expand any collapsed blocks containing lines less than a specified value.

Suppose we have a unified diff where line 10 and line 20 is changed, with a context of 3 lines, by default the diff component shows line 7-13 and 17-23. If we set a minimum collapsed lines to 5, the collapsed 3 lines (14, 15, 16) will be expanded by default.

`minCollapsedLines` accepts a single parameter:

- `{number} minLinesExclusive`: To specify the minimum lines that can live inside a collapsed block, any blocks with lines less that this value is expanded.

To expand blocks, an extra `oldSource` property is required to provide the original source of diff.

```jsx
import {Diff, minCollapsedLines} from 'react-diff-view';

const EnhancedDiff = minCollapsedLines(10)(Diff);

<EnhancedDiff ... /> // Remember to provide oldSource prop
```

### Expand collapsed blocks

The `withSourceExpansion` HOC provides the ability to expand collapsed text blocks.

It has currently no paramater and will pass one extra prop to wrapped component:

- `{Function} onExpandRange`: Callback to expand a range of text, the parameter is simply `({number} startLineNumber, {number} endLineNumber)`.

An extra `oldSource` property is requried when introduce this HOC.

As an example, we add a decoration between hunks and allow user to expand the collapsed text block by clicking on it:

```jsx
import {Diff, Decoration, Hunk, withSourceExpansion} from 'react-diff-view';

const UnfoldCollapsed = ({previousHunk, currentHunk, onClock}) => {
    const start = previousHunk ? previousHunk.oldStart + previousHunk.oldLines : 1;
    const end = currentHunk.oldStart - 1;

    return (
        <div onClick={() => onClick(start, end)}>
            Click to expand
        </div>
    )
};

const renderHunk = (children, hunk, i, hunks) => {
    const previousElement = children[children.length - 1];
    const decorationElement = (
        <UnfoldCollapsed
            key={'decoration-' + hunk.content}
            previousHunk={previousElement && previousElement.props.hunk}
            currentHunk={hunk}
            onClick={onExpandRange}
        />
    );
    children.push(decorationElement);

    const hunkElement = (
        <Hunk
            key={'hunk-' + hunk.content}
            hunk={hunk}
        />
    );
    children.push(hunkElement);

    return children;
};

const DiffView = ({hunks, onExpandRange}) => (
    <Diff hunks={hunks}>
        {hunks => hunks.reduce(renderHunk, [])}
    </Diff>
);

<DiffView ... /> // Remember to provide oldSource prop
```

### Tokenize in web worker

The `withTokenizeWorker` HOC enables you to enjoy the token system in a web worker, which won't make browser unresponsive when process massive changes.

To use this HOC, you should first implement a worker which complies with its protocol. Your worker should receive messages with a data like:

```json
{
    "type": "tokenize",
    "id": 112,
    "payload": {
        "language": "jsx",
        "oldSource": "console.log(123)",
        "hunks": [...]
    }
}
```

After successfully tokenized all changes, you should post a message with a data in format:

```json
{
    "id": 112,
    "payload": {
        "success": true,
        "tokens": [...]
    }
}
```

Or when tokenization fails, the message format should be:

```json
{
    "id": 112,
    "payload": {
        "success": false,
        "reason": "Any reason"
    }
}
```

The most important thing is that you must assign the `id` property to the value you received from `message` event, any data with unmatched id value are ignored.

This is a very simple worker implement:

```javascript
import {tokenize, markEdits, markWord} from 'react-diff-view/tokenize';
import {compact} from 'lodash';
import refractor from 'refractor';

self.addEventListener(
    'message',
    ({data: {id, payload}}) => {
        const {hunks, oldSource, language} = payload;

        const options = {
            highlight: language !== 'text',
            refractor: refractor,
            language: language,
            oldSource: oldSource,
            enhancers: [
                markWord('\r', 'carriage-return', '␍'),
                markWord('\t', 'tab', '→'),
                markEdits(hunks, {type: 'block'})
            ]
        };

        try {
            const tokens = tokenize(hunks, options);
            const data = {
                id: id,
                payload: {
                    success: true,
                    tokens: tokens
                }
            };
            self.postMessage(data);
        }
        catch (ex) {
            const data = {
                id: id,
                payload: {
                    success: false,
                    reason: ex.message
                }
            };
            self.postMessage(data);
        }
    }
);
```

`withTokenizeWorker` HOC receives 2 parameters:

- `{Worker} worker`: A web worker instance.
- `{Object} options`: An options obejct with properties:
    - `{Function} mapPayload`: A function to receive `(payload, props)` and returns a new payload, you can add any properties you want to pass to worker here.
    - `{Function} shouldTokenize`: A function to receive `(currentPayload, prevPayload)` and returns a boolean value indicating whether we should post a message to worker to tokenize current payload.

The `shouldTokenize` function is very important as `shouldComponentUpdate` in react components, for the first time a tokenize chance appears, the `prevPayload` argument is an empty object (`{}`). The default logic of `shouldTokenize` is:

1. When `oldSource` property is changed, a new tokenization process is started.
2. When `oldSource` property is provided but remains identical, it shallow compares two payload objects excluding `hunks` property, `hunks`'s identity is determined by comparing all insert and delete changes, this is because common operations like expanding a collapsed block can create different hunks array, but since the actual changes remain identical, it should have no impact on the tokenize result.
3. If `oldSource` is not provided, simply shallow compare of two payload objects.

The HOC will pass some extra props to wrapped component:

- `{Array} tokens`: Tokens when tokenization success, simply pass it to `Diff` component.
- `{any} tokenizationFailReason`: The reason when tokenization fails.

When highlight is enabled in web worker, a `language` prop is required to tell the language of source code. We can enable worker tokenization simple by:

```jsx
import {withTokenizeWorker, Diff, Hunk} from 'react-diff-view';
import TokenizeWorker from './tokenize.worker.js'; // See above example

const worker = new TokenizeWorker();

const EnhancedDiff = withTokenizeWorker(worker)(Diff);

// Able to provide oldSource prop
// Require language prop
<EnhancedDiff language="jsx" ... />
```
