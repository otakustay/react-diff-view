import {markWord} from '..';

describe('markWord', () => {
    test('returns a function', () => {
        expect(typeof markWord()).toBe('function');
    });

    test('empty', () => {
        expect(markWord()([[{}], []])).toEqual([[[]], []]);
    });

    test('value', () => {
        expect(markWord('A')([
            [[[{value: ''}]]], // oldLinesOfPaths
            [[[{value: ''}]]], // newLinesOfPaths
        ])).toEqual([[[[{value: ''}]]], [[[{value: ''}]]]]);
    });

    test('hit', () => {
        expect(markWord('A')([
            [[[{value: 'A'}]]], // oldLinesOfPaths
            [[[{value: 'A'}]]], // newLinesOfPaths
        ])).toEqual([
            [[[{markType: undefined, type: 'mark', value: 'A'}]]],
            [[[{markType: undefined, type: 'mark', value: 'A'}]]],
        ]);
    });
});
