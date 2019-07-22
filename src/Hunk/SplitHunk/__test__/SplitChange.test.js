import renderer from 'react-test-renderer';
import {shallow} from 'enzyme';
import {partialRight, get} from 'lodash';
import SplitChange from '../SplitChange';

const defaultChange = {
    type: 'edit',
    lineNumber: 1,
    content: 'text',
};

const pickId = partialRight(get, 'content');

describe('SplitChange', () => {
    test('renders correctly', () => {
        expect(renderer.create(
            <SplitChange
                oldSelected={false}
                newSelected={false}
                oldChange={defaultChange}
                newChange={defaultChange}
                generateAnchorID={pickId}
            />
        ).toJSON()).toMatchSnapshot();
    });

    test('gutterEvents should be called with side', () => {
        const onClick = jest.fn();
        const gutterEvents = {onClick};
        const wrapper = shallow(
            <SplitChange
                oldSelected={false}
                newSelected={false}
                oldChange={defaultChange}
                newChange={defaultChange}
                generateAnchorID={pickId}
                gutterEvents={gutterEvents}
            />
        );

        wrapper.find('.diff-gutter').at(0).simulate('click');
        expect(onClick).toBeCalledWith({change: defaultChange, side: 'old'});

        wrapper.find('.diff-gutter').at(1).simulate('click');
        expect(onClick).toBeCalledWith({change: defaultChange, side: 'new'});
    });
});
