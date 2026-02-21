import {
    computeOldLineNumber,
    computeNewLineNumber,
    isDelete,
    isInsert,
} from '../utils';
import type {ChangeData} from '../utils';
import type {Side} from '../interface';

export function getGutterAriaLabel(change: ChangeData, side: Side): string {
    const oldNum = computeOldLineNumber(change);
    const newNum = computeNewLineNumber(change);

    if (side === 'old') {
        if (oldNum === -1) {
            return 'Not in old version';
        }
        if (isDelete(change)) {
            return `Deleted line ${oldNum}`;
        }
        return `Old line ${oldNum}`;
    }

    if (newNum === -1) {
        return 'Not in new version';
    }
    if (isInsert(change)) {
        return `Added line ${newNum}`;
    }
    return `New line ${newNum}`;
}

export function getCodeCellAriaLabel(change: ChangeData): string {
    const oldNum = computeOldLineNumber(change);
    const newNum = computeNewLineNumber(change);

    if (isInsert(change)) {
        return `Added line ${newNum}`;
    }
    if (isDelete(change)) {
        return `Deleted line ${oldNum}`;
    }
    return `Line ${newNum} unchanged`;
}
