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

const renderRow = ([type, key, value], props) => {
    const {hideGutter, selectedChanges, tokens, lineClassName, ...changeProps} = props;

    if (type === 'change') {
        const side = value.isDelete ? 'old' : 'new';
        const lineNumber = value.isDelete ? computeOldLineNumber(value) : computeNewLineNumber(value);
        const tokensOfLine = tokens ? tokens[side][lineNumber - 1] : null;

        return (
            <UnifiedChange
                key={`change${key}`}
                className={lineClassName}
                change={value}
                hideGutter={hideGutter}
                selected={selectedChanges.includes(key)}
                tokens={tokensOfLine}
                {...changeProps}
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
        className,
        ...childrenProps
    } = props;
    const elements = groupElements(hunk.changes, widgets);

    return (
        <tbody className={classNames('diff-hunk', className)}>
            {elements.map(element => renderRow(element, childrenProps))}
        </tbody>
    );
};

export default UnifiedHunk;
