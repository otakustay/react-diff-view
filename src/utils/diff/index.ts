// @ts-nocheck ignore: third-party
import {
    ComputeNewLineNumber,
    ComputeOldLineNumber,
    FindChangeByNewLineNumber,
    FindChangeByOldLineNumber, GetCorrespondingNewLineNumber, GetCorrespondingOldLineNumber,
} from '../../interface';
import {computeLineNumberFactory, findChangeByLineNumberFactory, getCorrespondingLineNumberFactory} from './factory';

export * from './insertHunk';
export * from './expandCollapsedBlockBy';
export * from './getChangeKey';

export const computeOldLineNumber: ComputeOldLineNumber = computeLineNumberFactory('old');

export const computeNewLineNumber: ComputeNewLineNumber = computeLineNumberFactory('new');

export const findChangeByOldLineNumber: FindChangeByOldLineNumber = findChangeByLineNumberFactory('old');

export const findChangeByNewLineNumber: FindChangeByNewLineNumber = findChangeByLineNumberFactory('new');

export const getCorrespondingOldLineNumber: GetCorrespondingOldLineNumber = getCorrespondingLineNumberFactory('new');

export const getCorrespondingNewLineNumber: GetCorrespondingNewLineNumber = getCorrespondingLineNumberFactory('old');
