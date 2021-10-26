// @ts-expect-error
import {configure} from 'enzyme';
// @ts-expect-error
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});
