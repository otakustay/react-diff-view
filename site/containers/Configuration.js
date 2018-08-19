import Configuration from '../components/Configuration';
import {joinConfiguration} from '../regions';

const mapToProps = ({update, ...configuration}) => {
    return {
        onChange: update,
        ...configuration
    };
};

export default joinConfiguration(mapToProps)(Configuration);
