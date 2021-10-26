import {wrapDisplayName} from 'recompose';
import {ComponentType} from 'react';
import {useSourceExpansion} from '../hooks';

const withSourceExpansion = () => (ComponentIn: ComponentType<any>) => {
    function ComponentOut(props: any) {
        const [renderingHunks, expandRange] = useSourceExpansion(props.hunks, props.oldSource);

        return (
            <ComponentIn
                {...props}
                hunks={renderingHunks}
                onExpandRange={expandRange}
            />
        );
    }

    ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withSourceExpansion');

    return ComponentOut;
};

export default withSourceExpansion;
