import {tokenize} from '..';

describe('tokenize', () => {
    test('basic', () => {
        expect(tokenize([], {})).toEqual({
            new: [[{type: 'text', value: ''}]],
            old: [[{type: 'text', value: ''}]]
        });
    });

    test('config', () => {
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
});
