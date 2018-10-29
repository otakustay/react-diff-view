import {markEdits} from '..';

describe('markEdits', () => {
    test('returns a function', () => {
        expect(typeof markEdits([], {})).toBe('function');
    });
});
