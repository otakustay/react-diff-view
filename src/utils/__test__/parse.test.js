import {basic} from '../../__test__/cases';
import {parseDiff} from '..';

describe('parseDiff', () => {
    test('basic', () => {
        expect(parseDiff(basic)).toMatchSnapshot();
    });

    test('trim', () => {
        expect(parseDiff(`\n${basic}`)).toMatchSnapshot();
    });
});
