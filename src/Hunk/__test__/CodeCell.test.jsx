import renderer from 'react-test-renderer';
import CodeCell from '../CodeCell';

describe('renderToken', () => {
    test('renders correctly', () => {
        expect(renderer.create(
            <CodeCell text="A" />
        ).toJSON()).toMatchSnapshot();
    });

    test('use renderToken', () => {
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
        expect(renderer.create(
            // eslint-disable-next-line react/jsx-no-bind
            <CodeCell text="A" renderToken={renderToken} />
        ).toJSON()).toMatchSnapshot();
    });

    test('ref token', () => {
        const renderToken = (token, defaultRender, i) => {
            if (token.type === 'ref') {
                return (
                    <span key={i} className="ref-container">
                        {defaultRender(token, i)}
                    </span>
                );
            }
            return defaultRender(token, i);
        };
        const tokens = [{type: 'ref', className: 'ref'}];
        expect(renderer.create(
            // eslint-disable-next-line react/jsx-no-bind
            <CodeCell text="A" tokens={tokens} renderToken={renderToken} />
        ).toJSON()).toMatchSnapshot();
    });
});
