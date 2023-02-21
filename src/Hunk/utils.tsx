import {ReactNode} from 'react';
import {Side} from '../interface';
import {computeOldLineNumber, computeNewLineNumber, ChangeData} from '../utils';

export function renderDefaultBy(change: ChangeData, side: Side) {
    return (): ReactNode => {
        const lineNumber = side === 'old' ? computeOldLineNumber(change) : computeNewLineNumber(change);
        return lineNumber === -1 ? undefined : lineNumber;
    };
}

export function wrapInAnchorBy(gutterAnchor: boolean, anchorTarget: string | null | undefined) {
    return (element: ReactNode): ReactNode => {
        if (!gutterAnchor || !element) {
            return element;
        }

        return <a href={anchorTarget ? '#' + anchorTarget : undefined}>{element}</a>;
    };
}

export function composeCallback<E>(own: () => void, custom: ((e: E) => void) | undefined) {
    if (custom) {
        return (e: E) => {
            own();
            custom(e); // `custom` is already bound with `arg`
        };
    }

    return own;
}
