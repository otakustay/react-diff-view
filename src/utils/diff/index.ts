import {computeLineNumberFactory, findChangeByLineNumberFactory, getCorrespondingLineNumberFactory} from './factory';

export * from './insertHunk';
export * from './expandCollapsedBlockBy';
export * from './getChangeKey';

export const computeOldLineNumber = computeLineNumberFactory('old');

export const computeNewLineNumber = computeLineNumberFactory('new');

export const findChangeByOldLineNumber = findChangeByLineNumberFactory('old');

export const findChangeByNewLineNumber = findChangeByLineNumberFactory('new');

export const getCorrespondingOldLineNumber = getCorrespondingLineNumberFactory('new');

export const getCorrespondingNewLineNumber = getCorrespondingLineNumberFactory('old');
