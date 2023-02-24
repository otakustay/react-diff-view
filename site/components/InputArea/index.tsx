import {useReducer} from 'react';
import DiffText from './DiffText';
import DiffSource from './DiffSource';

interface DiffData {
    diff: string;
    source: string | null;
}

interface Props {
    className?: string;
    onSubmit: (data: DiffData) => void;
}

export default function InputArea(props: Props) {
    const [inputType, switchInputType] = useReducer(
        value => (value === 'diff' ? 'source' : 'diff'),
        'source'
    );

    return inputType === 'diff'
        ? <DiffText onSwitchInputType={switchInputType} {...props} />
        : <DiffSource onSwitchInputType={switchInputType} {...props} />;
}
