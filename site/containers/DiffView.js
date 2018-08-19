import {omit} from 'lodash';
import DiffView from '../components/DiffView';
import {joinConfiguration} from '../regions';

const mapToProps = context => omit(context, 'update');

export default joinConfiguration(mapToProps)(DiffView);
