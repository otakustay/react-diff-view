import classNames from 'classnames';
import {getChangeKey, computeOldLineNumber, computeNewLineNumber} from '../../utils';
import SplitChange from './SplitChange';
import SplitWidget from './SplitWidget';

const keyForPair = (x, y) => {
    const keyForX = x ? getChangeKey(x) : '00';
    const keyForY = y ? getChangeKey(y) : '00';
    return keyForX + keyForY;
};

const groupElements = (changes, widgets) => {
    const findWidget = change => {
        if (!change) {
            return null;
        }

        const key = getChangeKey(change);
        return widgets[key] || null;
    };
    const elements = [];

    // This could be a very complex reduce call, use `for` loop seems to make it a little more readable
    for (let i = 0; i < changes.length; i++) {
        const current = changes[i];

        // A normal change is displayed on both side
        if (current.isNormal) {
            elements.push(['change', keyForPair(current, current), current, current]);
        }
        else if (current.isDelete) {
            const next = changes[i + 1];
            // If an insert change is following a elete change, they should be displayed side by side
            if (next && next.isInsert) {
                i = i + 1;
                elements.push(['change', keyForPair(current, next), current, next]);
            }
            else {
                elements.push(['change', keyForPair(current, null), current, null]);
            }
        }
        else {
            elements.push(['change', keyForPair(null, current), null, current]);
        }

        const rowChanges = elements[elements.length - 1];
        const [oldWidget, newWidget] = rowChanges.slice(2).map(findWidget);
        if (oldWidget || newWidget) {
            const key = rowChanges[1];
            elements.push(['widget', key, oldWidget, newWidget]);
        }
    }

    return elements;
};

const renderRow = ([type, key, oldValue, newValue], selectedChanges, monotonous, hideGutter, tokens, props) => {
    if (type === 'change') {
        const oldSelected = oldValue ? selectedChanges.includes(getChangeKey(oldValue)) : false;
        const newSelected = newValue ? selectedChanges.includes(getChangeKey(newValue)) : false;
        const oldTokens = (oldValue && tokens) ? tokens.old[computeOldLineNumber(oldValue) - 1] : null;
        const newTokens = (newValue && tokens) ? tokens.new[computeNewLineNumber(newValue) - 1] : null;

        return (
            <SplitChange
                key={`change${key}`}
                oldChange={oldValue}
                newChange={newValue}
                monotonous={monotonous}
                hideGutter={hideGutter}
                oldSelected={oldSelected}
                newSelected={newSelected}
                oldTokens={oldTokens}
                newTokens={newTokens}
                {...props}
            />
        );
    }
    else if (type === 'widget') {
        return (
            <SplitWidget
                key={`widget${key}`}
                monotonous={monotonous}
                hideGutter={hideGutter}
                oldElement={oldValue}
                newElement={newValue}
            />
        );
    }

    return null;
};

const SplitHunk = props => {
    const {
        hunk,
        monotonous,
        hideGutter,
        widgets,
        selectedChanges,
        tokens,
        className,
        ...childrenProps
    } = props;
    const elements = groupElements(hunk.changes, widgets);

    return (
        <tbody className={classNames('diff-hunk', className)}>
            {elements.map(item => renderRow(item, selectedChanges, monotonous, hideGutter, tokens, childrenProps))}
        </tbody>
    );
};

export default SplitHunk;
