import {describe, test, expect} from 'vitest';
import {Pair, TokenPath} from '../interface';
import markWord from '../markWord';

describe('markWord', () => {
    test('no match', () => {
        const mark = markWord('x', 'mark');
        const input: Pair<TokenPath[][]> = [
            [
                [[{type: 'text', value: 'abc'}]],
            ],
            [
                [[{type: 'text', value: 'abc'}]],
            ],
        ];
        const result = mark(input);
        expect(result).toEqual(input);
    });

    test('single occurence', () => {
        const mark = markWord('A', 'first', 'a');
        const input: Pair<TokenPath[][]> = [
            [
                [[{type: 'text', value: 'AAaabb'}]],
            ],
            [
                [[{type: 'text', value: ''}]],
            ],
        ];
        const result = mark(input);
        const expected: Pair<TokenPath[][]> = [
            [
                [
                    [{type: 'mark', markType: 'first', value: 'a'}],
                    [{type: 'mark', markType: 'first', value: 'a'}],
                    [{type: 'text', value: 'aabb'}],
                ],
            ],
            [
                [[{type: 'text', value: ''}]],
            ],
        ];
        expect(result).toEqual(expected);
    });

    test('complex word', () => {
        const mark = markWord('\t', 'tab', '    ');
        const input: Pair<TokenPath[][]> = [
            [
                [[{type: 'text', value: '\t\t    bb'}]],
            ],
            [
                [[{type: 'text', value: ''}]],
            ],
        ];
        const result = mark(input);
        const expected: Pair<TokenPath[][]> = [
            [
                [
                    [{markType: 'tab', type: 'mark', value: '    '}],
                    [{markType: 'tab', type: 'mark', value: '    '}],
                    [{type: 'text', value: '    bb'}],
                ],
            ],
            [
                [[{type: 'text', value: ''}]],
            ],
        ];
        expect(result).toEqual(expected);
    });
});
