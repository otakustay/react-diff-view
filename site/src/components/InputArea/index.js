import {useReducer} from 'react';
import DiffText from './DiffText';
import DiffSource from './DiffSource';

const InputArea = props => {
    const [inputType, switchInputType] = useReducer(
        value => (value === 'diff' ? 'source' : 'diff'),
        'source'
    );

    return inputType === 'diff'
        ? <DiffText onSwitchInputType={switchInputType} {...props} />
        : <DiffSource onSwitchInputType={switchInputType} {...props} />;
};

export default InputArea;
