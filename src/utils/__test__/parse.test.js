import {parseDiff} from '..';
import {basic} from '../../__test__/cases';

describe('parseDiff', () => {
    test('basic', () => {
        expect(parseDiff(basic)).toMatchSnapshot();
    });

    test('trim', () => {
        expect(parseDiff(`\n${basic}`)).toMatchSnapshot();
    });
});
