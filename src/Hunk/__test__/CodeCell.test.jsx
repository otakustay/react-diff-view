import renderer from 'react-test-renderer';
import {basicHunk} from '../../__test__/cases';
import CodeCell from '../CodeCell';

const renderToken = (token, defaultRender, i) => {
    if (token.type === 'searchResult') {
        return (
            <span key={i} className="search-result">
                {token.children && token.children.map((token, i) => renderToken(token, defaultRender, i))}
            </span>
        );
    }
    return defaultRender(token, i);
};


describe('renderToken', () => {
    test('renders correctly', () => {
        expect(renderer.create(
            <CodeCell text="A" />
        ).toJSON()).toMatchSnapshot();
    });

    test('use renderToken', () => {
        expect(renderer.create(
            <CodeCell text="A" renderToken={renderToken} />
        ).toJSON()).toMatchSnapshot();
    });
});
