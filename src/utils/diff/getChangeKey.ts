// @ts-nocheck ignore: third-party
import {GetChangeKey} from '../../interface';

export const getChangeKey: GetChangeKey = change => {
    if (!change) {
        throw new Error('change is not provided');
    }

    const {isNormal, isInsert, lineNumber, oldLineNumber} = change;

    if (isNormal) {
        return 'N' + oldLineNumber;
    }

    const prefix = isInsert ? 'I' : 'D';
    return prefix + lineNumber;
};
