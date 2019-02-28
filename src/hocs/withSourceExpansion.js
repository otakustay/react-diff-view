import {wrapDisplayName} from 'recompose';
import {useSourceExpansion} from '../hooks';

export default () => ComponentIn => {
    const ComponentOut = props => {
        const [renderingHunks, expandRange] = useSourceExpansion(props.hunks, props.oldSource);

        return (
            <ComponentIn
                {...props}
                hunks={renderingHunks}
                onExpandRange={expandRange}
            />
        );
    };

    ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withSourceExpansion');

    return ComponentOut;
};
