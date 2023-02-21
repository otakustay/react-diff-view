import {ChangeData, isNormal, isInsert} from '../parse';

export function getChangeKey(change: ChangeData) {
    if (!change) {
        throw new Error('change is not provided');
    }

    if (isNormal(change)) {
        return `N${change.oldLineNumber}`;
    }

    const prefix = isInsert(change) ? 'I' : 'D';
    return `${prefix}${change.lineNumber}`;
}
