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
export {parseDiff} from './parse';
export type {Source} from './diff';
export type {ParseOptions, FileData, HunkData, ChangeData} from './parse';
