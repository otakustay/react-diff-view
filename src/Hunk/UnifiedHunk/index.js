import classNames from 'classnames';
import {getChangeKey, computeOldLineNumber, computeNewLineNumber} from '../../utils';
import UnifiedChange from './UnifiedChange';
import UnifiedWidget from './UnifiedWidget';

const groupElements = (changes, widgets) => changes.reduce(
    (elements, change) => {
        const key = getChangeKey(change);

        elements.push(['change', key, change]);

        const widget = widgets[key];

        if (widget) {
            elements.push(['widget', key, widget]);
        }

        return elements;
    },
    []
);

const renderRow = ([type, key, value], selectedChanges, tokens, props) => {
    const {hideGutter} = props;

    if (type === 'change') {
        const side = value.isDelete ? 'old' : 'new';
        const lineNumber = value.isDelete ? computeOldLineNumber(value) : computeNewLineNumber(value);
        const tokensOfLine = tokens ? tokens[side][lineNumber - 1] : null;

        return (
            <UnifiedChange
                key={`change${key}`}
                change={value}
                selected={selectedChanges.includes(key)}
                tokens={tokensOfLine}
                {...props}
            />
        );
    }
    else if (type === 'widget') {
        return <UnifiedWidget key={`widget${key}`} hideGutter={hideGutter} element={value} />;
    }

    return null;
};

const UnifiedHunk = props => {
    const {
        hunk,
        widgets,
        selectedChanges,
        tokens,
        className,
        ...childrenProps
    } = props;
    const elements = groupElements(hunk.changes, widgets);

    return (
        <tbody className={classNames('diff-hunk', className)}>
            {elements.map(element => renderRow(element, selectedChanges, tokens, childrenProps))}
        </tbody>
    );
};

export default UnifiedHunk;
