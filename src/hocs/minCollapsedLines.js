import {wrapDisplayName} from './wrapDisplayName';
import {useMinCollapsedLines} from '../hooks';

export default minLinesExclusive => ComponentIn => {
    const ComponentOut = props => {
        const renderingHunks = useMinCollapsedLines(minLinesExclusive, props.hunks, props.oldSource);
        return <ComponentIn {...props} hunks={renderingHunks} />;
    };

    ComponentOut.displayName = wrapDisplayName(ComponentIn, 'minCollapsedLines');

    return ComponentOut;
};
