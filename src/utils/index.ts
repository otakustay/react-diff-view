export {
    computeNewLineNumber,
    computeOldLineNumber,
    expandCollapsedBlockBy,
    expandFromRawCode,
    findChangeByNewLineNumber,
    findChangeByOldLineNumber,
    getChangeKey,
    getCollapsedLinesCountBetween,
    getCorrespondingNewLineNumber,
    getCorrespondingOldLineNumber,
    insertHunk,
    textLinesToHunk,
} from './diff';
export {parseDiff, isInsert, isDelete, isNormal} from './parse';
export type {Source} from './diff';
export type {ParseOptions, FileData, HunkData, ChangeData} from './parse';
