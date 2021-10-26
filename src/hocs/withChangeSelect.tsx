import {wrapDisplayName} from 'recompose';
import {ComponentType} from 'react';
import {useChangeSelect} from '../hooks';

const withChangeSelect = (options?: {multiple?: boolean}) => (ComponentIn: ComponentType<any>) => {
    function ComponentOut(props: any) {
        const [selectedChanges, toggleChangeSelection] = useChangeSelect(props.hunks, options);

        return (
            <ComponentIn
                {...props}
                selectedChanges={selectedChanges}
                onToggleChangeSelection={toggleChangeSelection}
            />
        );
    }

    ComponentOut.displayName = wrapDisplayName(ComponentIn, 'withChangeSelect');

    return ComponentOut;
};

export default withChangeSelect;
