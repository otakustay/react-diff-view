import {tokenize} from '..';
import {basicHunk, multipleHunk} from '../../__test__/cases';

describe('tokenize', () => {
    test('basic', () => {
        expect(tokenize([], {})).toEqual({
            new: [[{type: 'text', value: ''}]],
            old: [[{type: 'text', value: ''}]]
        });
    });

    test('different config', () => {
        expect(tokenize([], {
            highlight: true,
            refractor: {highlight: text => [{type: 'text', value: text}]}
        })).toEqual({
            new: [[{type: 'text', value: ''}]],
            old: [[{type: 'text', value: ''}]]
        });

        expect(tokenize([], {oldSource: 'A'})).toEqual({
            new: [[{type: 'text', value: 'A'}]],
            old: [[{type: 'text', value: 'A'}]]
        });
    });

    test('withHunk', () => {
        expect(tokenize([basicHunk, multipleHunk], {})).toMatchSnapshot();
    });
});
