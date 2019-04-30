export const getChangeKey = change => {
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
