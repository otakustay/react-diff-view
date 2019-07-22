import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import {partialRight, get} from 'lodash';
import UnifiedChange from '../UnifiedChange';

const defaultChange = {
    content: 'text',
};

const pickId = partialRight(get, 'content');

describe('UnifiedChange', () => {
    test('renders correctly', () => {
        expect(renderer.create(
            <UnifiedChange change={defaultChange} generateAnchorID={pickId} />
        ).toJSON()).toMatchSnapshot();
    });

    test('gutterEvents should be called with side', () => {
        const onClick = jest.fn();
        const element = (
            <UnifiedChange
                selected={false}
                change={defaultChange}
                generateAnchorID={pickId}
                gutterEvents={{onClick}}
            />
        );
        const wrapper = shallow(element);
        wrapper.find('.diff-gutter').at(1).simulate('click');
        // TODO it should be called with {change: defaultChange, side: 'new'}
        expect(onClick).toBeCalledWith({change: defaultChange, side: undefined});
    });
});
