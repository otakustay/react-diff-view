import {withTransientRegion} from 'react-kiss';
import {Whether, Else} from 'react-whether';
import DiffText from './DiffText';
import DiffSource from './DiffSource';

const InputArea = ({inputType, ...props}) => (
    <Whether matches={inputType === 'diff'}>
        <DiffText {...props} />
        <Else>
            <DiffSource {...props} />
        </Else>
    </Whether>
);

const initialState = {
    inputType: 'source',
};

const workflows = {
    onSwitchInputType(payload, {inputType}) {
        const newInputType = inputType === 'diff' ? 'source' : 'diff';

        return {inputType: newInputType};
    },
};

export default withTransientRegion(initialState, workflows)(InputArea);
