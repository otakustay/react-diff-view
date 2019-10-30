import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import {partialRight, get} from 'lodash';
import UnifiedChange from '../UnifiedChange';

const defaultChange = {
    type: 'edit',
    content: 'text',
};

const pickId = partialRight(get, 'content');

const renderNull = () => null;

describe('UnifiedChange', () => {
    test('renders correctly', () => {
        expect(renderer.create(
            <UnifiedChange
                selected={false}
                change={defaultChange}
                generateAnchorID={pickId}
                renderGutter={renderNull}
            />
        ).toJSON()).toMatchSnapshot();
    });

    test('gutterEvents should be called with side', () => {
        const onClick = jest.fn();
        const gutterEvents = {onClick};
        const wrapper = shallow(
            <UnifiedChange
                selected={false}
                change={defaultChange}
                generateAnchorID={pickId}
                gutterEvents={gutterEvents}
                renderGutter={renderNull}
            />
        );
        // TODO diff gutter should be called with {change: defaultChange, side: 'old' & 'new'}
        wrapper.find('.diff-gutter').at(0).simulate('click');
        expect(onClick).toBeCalledWith({change: defaultChange, side: undefined});

        wrapper.find('.diff-gutter').at(1).simulate('click');
        expect(onClick).toBeCalledWith({change: defaultChange, side: undefined});
    });
});
