import {computeOldLineNumber, computeNewLineNumber} from '../utils';

export const renderDefaultBy = (change, side) => () => {
    const lineNumber = side === 'old' ? computeOldLineNumber(change) : computeNewLineNumber(change);
    return lineNumber === -1 ? undefined : lineNumber;
};

export const wrapInAnchorBy = (gutterAnchor, anchorTarget) => element => {
    if (!gutterAnchor || !element) {
        return element;
    }

    return <a href={'#' + anchorTarget}>{element}</a>;
};

export const composeCallback = (own, custom) => {
    if (custom) {
        return e => {
            own(e);
            custom(); // `custom` is already bound with `arg`
        };
    }

    return own;
};
