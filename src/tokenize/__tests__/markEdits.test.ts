// @ts-nocheck ignore: third-party
import {basicHunk, multipleHunk} from '../../__tests__/cases';
import markEdits from '../markEdits';

describe('markEdits', () => {
    test('returns a function', () => {
        expect(typeof markEdits([], {})).toBe('function');
    });

    test('empty', () => {
        expect(markEdits([], {})([[{}], [{}]])).toEqual([[{}], [{}]]);
        expect(markEdits([], {type: 'line'})([[{}], [{}]])).toEqual([[{}], [{}]]);
    });

    test('withHunk', () => {
        expect(markEdits([basicHunk], {})([[], []])).toMatchSnapshot();
        expect(markEdits([multipleHunk], {})([[], []])).toMatchSnapshot();
        expect(markEdits([basicHunk], {type: 'line'})([[], []])).toMatchSnapshot();
        expect(markEdits([multipleHunk], {type: 'line'})([[], []])).toMatchSnapshot();
    });
});
