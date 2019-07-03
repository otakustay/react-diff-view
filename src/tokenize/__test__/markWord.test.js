import {markWord} from '..';

describe('markWord', () => {
    test('returns a function', () => {
        expect(typeof markWord()).toBe('function');
    });

    test('empty', () => {
        expect(markWord()([[{}], []])).toEqual([[[]], []]);
    });

    test('hit value', () => {
        expect(markWord('A')([
            [[[{value: 'A'}]]], // oldLinesOfPaths
            [[[{value: 'A'}]]], // newLinesOfPaths
        ])).toEqual([
            [[[{markType: undefined, type: 'mark', value: 'A'}]]],
            [[[{markType: undefined, type: 'mark', value: 'A'}]]],
        ]);
    });

    test('mark single word', () => {
        expect(markWord('A', 'first', 'a')([
            [[[{value: 'AAaabb'}]]], // oldLinesOfPaths
            [[[{value: ''}]]], // newLinesOfPaths
        ])).toEqual([[[[{
            markType: 'first',
            type: 'mark',
            value: 'a',
        }], [{
            markType: 'first',
            type: 'mark',
            value: 'a',
        }], [{
            value: 'aabb',
        }]]], [[[{value: ''}]]]]);
    });

    test('mark complex word', () => {
        expect(markWord('\t', 'tab', '    ')([
            [[[{value: '\t\t    bb'}]]], // oldLinesOfPaths
            [[[{value: ''}]]], // newLinesOfPaths
        ])).toEqual([[[[{
            markType: 'tab',
            type: 'mark',
            value: '    ',
        }], [{
            markType: 'tab',
            type: 'mark',
            value: '    ',
        }], [{
            value: '    bb',
        }]]], [[[{value: ''}]]]]);
    });
});
