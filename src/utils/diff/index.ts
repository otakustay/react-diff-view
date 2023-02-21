import {computeLineNumberFactory, findChangeByLineNumberFactory, getCorrespondingLineNumberFactory} from './factory';

export {insertHunk, textLinesToHunk} from './insertHunk';
export {getChangeKey} from './getChangeKey';
export {expandCollapsedBlockBy, getCollapsedLinesCountBetween, expandFromRawCode} from './expandCollapsedBlockBy';

export type {Source} from './expandCollapsedBlockBy';

export const computeOldLineNumber = computeLineNumberFactory('old');

export const computeNewLineNumber = computeLineNumberFactory('new');

export const findChangeByOldLineNumber = findChangeByLineNumberFactory('old');

export const findChangeByNewLineNumber = findChangeByLineNumberFactory('new');

export const getCorrespondingOldLineNumber = getCorrespondingLineNumberFactory('new');

export const getCorrespondingNewLineNumber = getCorrespondingLineNumberFactory('old');
